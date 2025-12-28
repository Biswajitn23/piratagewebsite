import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { CreateEventRequest, CreateEventResponse, EventRecordDTO, ListEventsResponse } from "@shared/api";
import { randomUUID } from "crypto";
import { getFirestore, isFirestoreEnabled } from "../firebase";
import { processPendingNotifications } from "./notifications";

const DATA_DIR = process.env.DATA_DIR || ".data";
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readEvents(): EventRecordDTO[] {
  ensureDataDir();
  if (!fs.existsSync(EVENTS_FILE)) return [];
  try {
    const raw = fs.readFileSync(EVENTS_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as EventRecordDTO[];
    return [];
  } catch {
    return [];
  }
}

function writeEvents(events: EventRecordDTO[]) {
  ensureDataDir();
  const tmp = `${EVENTS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(events, null, 2));
  fs.renameSync(tmp, EVENTS_FILE);
}

export const listEvents: RequestHandler = async (_req, res) => {
  function normalize(events: EventRecordDTO[]): EventRecordDTO[] {
    const now = Date.now();
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

      const t = Date.parse(String(dateVal));

      // Prefer an explicit status from the source if provided (case-insensitive).
      const explicit = (raw.status || raw.Status || '').toString().trim().toLowerCase();
      let status: EventRecordDTO["status"] = 'past';
      if (explicit === 'ongoing' || explicit === 'upcoming' || explicit === 'past') {
        status = explicit as EventRecordDTO["status"];
      } else if (!Number.isNaN(t)) {
        // No explicit valid status: derive from date
        status = t > now ? 'upcoming' : 'past';
      } else {
        // Fallback when neither explicit status nor valid date available
        status = 'past';
      }

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
  const record: EventRecordDTO = {
    id,
    title: payload.title,
    date: payload.date,
    type: payload.type,
    status: payload.status,
    coverImage: payload.coverImage,
    gallery: payload.gallery || [],
    description: payload.description,
    speakers: payload.speakers || [],
    registrationLink: payload.registrationLink,
    slug: payload.slug,
    highlightScene: payload.highlightScene,
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
