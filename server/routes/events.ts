import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { CreateEventRequest, CreateEventResponse, EventRecordDTO, ListEventsResponse } from "@shared/api";
import { randomUUID } from "crypto";
import { getFirestore, isFirestoreEnabled } from "../firebase.js";
import { processPendingNotifications } from "./notifications.js";
import emailjs from "@emailjs/nodejs";
import { generateICS } from "../utils/ics-generator.js";
import { getEventStatus, normalizeEventStatus } from "../utils/event-status.js";
import { notifyDiscordNewEvent } from "../utils/discord-webhook.js";

const DATA_DIR = process.env.DATA_DIR || ".data";
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // On Vercel, filesystem is read-only, just skip
    console.log("[Events] Cannot create data directory (read-only filesystem)");
  }
}

function readEvents(): EventRecordDTO[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(EVENTS_FILE)) return [];
    const raw = fs.readFileSync(EVENTS_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as EventRecordDTO[];
    return [];
  } catch (err) {
    console.log("[Events] Cannot read events file:", err.message);
    return [];
  }
}

function writeEvents(events: EventRecordDTO[]) {
  try {
    ensureDataDir();
    const tmp = `${EVENTS_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(events, null, 2));
    fs.renameSync(tmp, EVENTS_FILE);
  } catch (err) {
    console.error("[Events] Cannot write events file (read-only filesystem):", err.message);
  }
}

/**
 * Automatically add event to all authenticated Google Calendar users
 * Runs as a best-effort background task - failures don't block event creation
 */
async function triggerCalendarAddForAllUsers(eventId: string) {
  if (!isFirestoreEnabled()) return;

  try {
    const db = getFirestore();
    
    // Get all users with Google Calendar authentication
    const usersSnapshot = await db.collection("google_calendar_users").get();
    
    if (usersSnapshot.empty) {
      console.log(`[Calendar Automation] No authenticated users found for event ${eventId}`);
      return;
    }

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL || "http://localhost:5173";

    // Trigger add-event API for each authenticated user
    const addEventPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userEmail = userDoc.id;
      try {
        const response = await fetch(`${baseUrl}/api/calendar/add-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, eventId }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.warn(`[Calendar Automation] Failed to add event ${eventId} to ${userEmail}:`, error.error);
        } else {
          console.log(`[Calendar Automation] Added event ${eventId} to ${userEmail}`);
        }
      } catch (error) {
        console.error(`[Calendar Automation] Error adding event ${eventId} to ${userEmail}:`, error);
      }
    });

    // Execute all add-event calls in parallel, don't wait for completion
    Promise.all(addEventPromises).catch((err) => {
      console.error("[Calendar Automation] Error during batch add-event:", err);
    });
  } catch (error) {
    console.error("[Calendar Automation] Error fetching authenticated users:", error);
  }
}

/**
 * Send calendar invite emails (.ics) to all active subscribers
 * Runs as a best-effort background task - failures don't block event creation
 */
async function sendEventInvitesToSubscribers(eventId: string) {
  if (!isFirestoreEnabled()) return;

  // Check EmailJS credentials
  if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_EVENT_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
    console.warn("[Event Invites] EmailJS not configured, skipping email invites");
    return;
  }

  try {
    const db = getFirestore();

    // Fetch the event
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      console.warn(`[Event Invites] Event ${eventId} not found`);
      return;
    }

    const event: EventRecordDTO = { id: eventDoc.id, ...eventDoc.data() } as EventRecordDTO;

    // Fetch all active subscribers
    const subscribersSnapshot = await db.collection("subscribers")
      .where("is_active", "==", true)
      .get();

    if (subscribersSnapshot.empty) {
      console.log(`[Event Invites] No active subscribers found for event ${eventId}`);
      return;
    }

    const subscribers = subscribersSnapshot.docs.map(doc => doc.data().email);

    // Generate ICS file
    let icsContent: string;
    try {
      icsContent = generateICS(event);
    } catch (error: any) {
      console.error(`[Event Invites] Failed to generate ICS for event ${eventId}:`, error?.message || error);
      return;
    }

    const appUrl = process.env.APP_URL || 'https://piratageauc.vercel.app';
    const icsDownloadUrl = `${appUrl}/api/download-ics?eventId=${eventId}`;

    // Format event date for display
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    console.log(`[Event Invites] Sending calendar invites for "${event.title}" to ${subscribers.length} subscribers`);

    let successCount = 0;
    let failCount = 0;

    // Send emails to all subscribers
    for (const email of subscribers) {
      try {
        // Get unsubscribe token
        const subscriberDoc = await db.collection("subscribers")
          .where("email", "==", email)
          .limit(1)
          .get();

        const unsubscribeToken = subscriberDoc.docs[0]?.data().unsubscribe_token || '';
        const unsubscribeUrl = unsubscribeToken 
          ? `${appUrl}/api/unsubscribe?token=${unsubscribeToken}`
          : '';

        const templateParams = {
          to_email: email,
          to_name: email.split('@')[0],
          subject: `New Event: ${event.title} 📅`,
          event_title: event.title,
          event_date: formattedDate,
          event_time: formattedTime,
          event_location: event.location || event.venue || 'TBA',
          event_description: event.description || 'No description provided',
          event_cover_url: event.coverImage || '',
          event_url: event.registrationLink || `${appUrl}/#events`,
          ics_download_url: icsDownloadUrl,
          unsubscribe_url: unsubscribeUrl,
          app_url: appUrl,
          logo_url: 'https://piratageauc.vercel.app/piratagelogo.webp',
          year: new Date().getFullYear().toString(),
        };

        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_EVENT_TEMPLATE_ID,
          templateParams,
          {
            publicKey: process.env.EMAILJS_PUBLIC_KEY,
            privateKey: process.env.EMAILJS_PRIVATE_KEY,
          }
        );

        successCount++;
      } catch (error: any) {
        console.error(`[Event Invites] Failed to send invite to ${email}:`, error?.message || error);
        failCount++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Event Invites] Sent ${successCount} invites, ${failCount} failed`);
  } catch (error: any) {
    console.error("[Event Invites] Error sending invites:", error?.message || error);
  }
}

export const listEvents: RequestHandler = async (_req, res) => {
  function normalize(events: EventRecordDTO[]): EventRecordDTO[] {
    return events.map((e) => {
      const raw: any = e || {};
      // normalize common casing variations from external sources
      const dateVal = raw.date || raw.Date || raw.event_date || raw.EventDate || '';
      const coverVal = raw.coverImage || raw.coverimage || raw.cover_image || raw.cover || '';
      const galleryVal = raw.gallery || raw.Gallery || raw.gallery_images || raw.galleryImage || [];
      const speakersVal = raw.speakers || raw.Speakers || [];
      const registrationVal = raw.registrationLink || raw.registrationlink || raw.registration_link || raw.registration || '';
      const slugVal = raw.slug || raw.Slug || raw.event_slug || '';
      const descVal = raw.description || raw.Description || raw.desc || '';
      const locationVal = raw.location || raw.Location || '';
      const venueVal = raw.venue || raw.Venue || '';

      // Use utility function to compute status based on current date/time
      const status = getEventStatus(dateVal, raw.endTime);

      return {
        id: raw.id || String(raw._id || raw.ID || ''),
        title: raw.title || raw.Title || '',
        date: String(dateVal || raw.date || ''),
        type: raw.type || raw.Type || '',
        status,
        coverImage: String(coverVal || ''),
        gallery: Array.isArray(galleryVal) ? galleryVal : [],
        description: String(descVal || ''),
        speakers: Array.isArray(speakersVal) ? speakersVal : [],
        registrationLink: String(registrationVal || ''),
        slug: String(slugVal || ''),
        location: String(locationVal || ''),
        venue: String(venueVal || ''),
        highlightScene: raw.highlightScene || raw.highlightscene || raw.highlight || undefined,
      } as EventRecordDTO;
    });
  }

  if (isFirestoreEnabled()) {
    getFirestore()
      .collection("events")
      .get()
      .then((snap) => {
        console.log(`[Events API] Fetched ${snap.docs.length} events from Firestore`);
        const events: EventRecordDTO[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventRecordDTO, "id">) }));
        // Sort in memory to avoid requiring a Firestore index
        const sorted = events.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        });
        const norm = normalize(sorted);
        console.log(`[Events API] Returning ${norm.length} normalized events`);
        res.setHeader("X-Events-Source", "firestore");
        res.json({ events: norm } satisfies ListEventsResponse);
      })
      .catch((error) => {
        console.error("[Events API] Firestore error:", error.message);
        const events = normalize(readEvents().sort((a, b) => (a.date < b.date ? 1 : -1)));
        res.setHeader("X-Events-Source", "file");
        res.json({ events } satisfies ListEventsResponse);
      });
    return;
  }

  const events = readEvents().sort((a, b) => (a.date < b.date ? 1 : -1));
  const response: ListEventsResponse = { events: normalize(events) };
  res.setHeader("X-Events-Source", "file");
  res.json(response);
};

export const createEvent: RequestHandler = async (req, res) => {
  const payload = req.body as CreateEventRequest;
  const id = payload.id || payload.slug || randomUUID();
  
  // Compute the actual status based on event date/time
  const computedStatus = getEventStatus(payload.date);
  
  const record: EventRecordDTO = {
    id,
    title: payload.title,
    date: payload.date,
    type: payload.type,
    status: computedStatus,
    coverImage: payload.coverImage,
    gallery: payload.gallery || [],
    description: payload.description,
    speakers: payload.speakers || [],
    registrationLink: payload.registrationLink,
    slug: payload.slug,
    highlightScene: payload.highlightScene,
    location: payload.location || "",
    venue: payload.venue || "",
  };

  if (isFirestoreEnabled()) {
    try {
      const db = getFirestore();
      await db.collection("events").doc(id).set(record, { merge: false });
      
      // Create notification entry
      const notificationId = randomUUID();
      await db.collection("email_notifications").doc(notificationId).set({
        id: notificationId,
        event_id: id,
        event_title: record.title,
        sent_to_count: 0,
        status: "pending",
        created_at: new Date().toISOString()
      });
      
      res.setHeader("X-Events-Source", "firestore");
      
      // Best-effort: process pending notifications immediately (non-blocking)
      processPendingNotifications().catch((e) => console.warn("Email notifications processing failed:", e?.message || e));
      
      // Best-effort: add event to all authenticated Google Calendar users (non-blocking)
      triggerCalendarAddForAllUsers(id).catch((e) => console.warn("Calendar automation failed:", e?.message || e));
      
      // Best-effort: send calendar invites via email to all subscribers (non-blocking)
      sendEventInvitesToSubscribers(id).catch((e) => console.warn("Event invites failed:", e?.message || e));
      
      // Best-effort: send Discord webhook notification (non-blocking)
      notifyDiscordNewEvent(record).catch((e) => console.warn("Discord notification failed:", e?.message || e));
      
      return res.status(201).json({ event: record } satisfies CreateEventResponse);
    } catch (err: any) {
      return res.status(400).json({ error: String(err?.message || err || "Failed to create event") });
    }
  }

  const current = readEvents();
  if (current.some((e) => e.id === id || e.slug === payload.slug)) {
    return res.status(409).json({ error: "Event with same id or slug already exists" });
  }
  current.push(record);
  writeEvents(current);
  const response: CreateEventResponse = { event: record };
  res.setHeader("X-Events-Source", "file");
  res.status(201).json(response);
};
