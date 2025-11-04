import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { CreateEventRequest, CreateEventResponse, EventRecordDTO, ListEventsResponse } from "@shared/api";
import { randomUUID } from "crypto";
import { getFirestore, isFirestoreEnabled } from "../firebase";

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

export const listEvents: RequestHandler = (_req, res) => {
  if (isFirestoreEnabled()) {
    getFirestore()
      .collection("events")
      .orderBy("date", "desc")
      .get()
      .then((snap) => {
        const events: EventRecordDTO[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventRecordDTO, "id">) }));
        res.setHeader("X-Events-Source", "firestore");
        res.json({ events } satisfies ListEventsResponse);
      })
      .catch(() => {
        const events = readEvents().sort((a, b) => (a.date < b.date ? 1 : -1));
        res.setHeader("X-Events-Source", "file");
        res.json({ events } satisfies ListEventsResponse);
      });
    return;
  }

  const events = readEvents().sort((a, b) => (a.date < b.date ? 1 : -1));
  const response: ListEventsResponse = { events };
  res.setHeader("X-Events-Source", "file");
  res.json(response);
};

export const createEvent: RequestHandler = (req, res) => {
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
    getFirestore()
      .collection("events")
      .doc(id)
      .set({ ...record, id: undefined }, { merge: false })
      .then(() => {
        res.setHeader("X-Events-Source", "firestore");
        res.status(201).json({ event: record } satisfies CreateEventResponse);
      })
      .catch((err) => res.status(400).json({ error: String(err?.message || err || "Failed to create event") }));
    return;
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
