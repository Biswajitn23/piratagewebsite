import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { CreateEventRequest, CreateEventResponse, EventRecordDTO, ListEventsResponse } from "@shared/api";
import { randomUUID } from "crypto";
import { getFirestore, isFirestoreEnabled } from "../firebase";
import { isSupabaseEnabled, getSupabase } from "../supabase";

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
        highlightScene: raw.highlightScene || raw.highlightscene || raw.highlight || undefined,
      } as EventRecordDTO;
    });
  }

  if (isSupabaseEnabled()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (error) throw error;
      let events: EventRecordDTO[] = normalize((data || []) as EventRecordDTO[]);

      // If coverImage is stored as a storage path (not an HTTP URL), convert it to a public URL
      events = events.map((e) => {
        try {
          if (e.coverImage && !/^https?:\/\//i.test(e.coverImage)) {
            // guess bucket from first path segment, fallback to 'events'
            const parts = e.coverImage.split('/');
            const bucket = parts.length > 1 ? parts[0] : 'events';
            const path = e.coverImage;
            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
            if (publicData && (publicData as any).publicUrl) {
              return { ...e, coverImage: (publicData as any).publicUrl } as EventRecordDTO;
            }
          }
        } catch (err) {
          // ignore and return original event
        }
        return e;
      });
      res.setHeader("X-Events-Source", "supabase");
      res.json({ events } satisfies ListEventsResponse);
    } catch {
      const events = normalize(readEvents().sort((a, b) => (a.date < b.date ? 1 : -1)));
      res.setHeader("X-Events-Source", "file");
      res.json({ events } satisfies ListEventsResponse);
    }
    return;
  }

  if (isFirestoreEnabled()) {
    getFirestore()
      .collection("events")
      .orderBy("date", "asc")
      .get()
      .then((snap) => {
        const events: EventRecordDTO[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventRecordDTO, "id">) }));
        const norm = normalize(events);
        res.setHeader("X-Events-Source", "firestore");
        res.json({ events: norm } satisfies ListEventsResponse);
      })
      .catch(() => {
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

  if (isSupabaseEnabled()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("events").upsert([record], { onConflict: "id" });
      if (error) return res.status(400).json({ error: String(error.message || error) });
      res.setHeader("X-Events-Source", "supabase");
      return res.status(201).json({ event: record } satisfies CreateEventResponse);
    } catch (err) {
      return res.status(400).json({ error: String(err?.message || err || "Failed to create event") });
    }
  }

  if (isFirestoreEnabled()) {
    try {
      await getFirestore().collection("events").doc(id).set({ ...record, id: undefined }, { merge: false });
      res.setHeader("X-Events-Source", "firestore");
      return res.status(201).json({ event: record } satisfies CreateEventResponse);
    } catch (err) {
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
