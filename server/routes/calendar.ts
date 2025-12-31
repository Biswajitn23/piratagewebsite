import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase";

/**
 * Generate an iCalendar (.ics) file from Firestore events
 * This allows users to subscribe to the calendar in their calendar apps
 */
export const handleCalendar: RequestHandler = async (req, res) => {
  try {
    console.log("[Calendar] Request received");
    if (!isFirestoreEnabled()) {
      console.log("[Calendar] Firestore not enabled");
      return res.status(503).send("Calendar service unavailable - Firestore not configured");
    }
    console.log("[Calendar] Firestore enabled, fetching events");

    const db = getFirestore();
    // Get all events
    const snapshot = await db.collection("events").get();

    const events = snapshot.docs
      .map(doc => doc.data())
      .filter(event => event.date) // Only include events with valid dates
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log(`[Calendar] Found ${events.length} events with valid dates`);

    // Generate iCalendar format
    const icsContent = generateICS(events || []);

    console.log(`[Calendar] Generated ICS content, length: ${icsContent.length} bytes`);

    // Set headers for .ics file download
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="piratage-events.ics"');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(icsContent);
  } catch (error) {
    console.error("Calendar generation error:", error);
    res.status(500).send("Error generating calendar");
  }
};

/**
 * Generate iCalendar (ICS) format from events
 */
function generateICS(events: any[]): string {
  const now = new Date();
  const timestamp = formatICSDate(now);

  // ICS header
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Piratage Club//Events Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Piratage Events",
    "X-WR-CALDESC:Upcoming events from Piratage - The Ethical Hacking Club",
    "X-WR-TIMEZONE:UTC",
  ].join("\r\n");

  // Add each event
  for (const event of events) {
    if (!event.date) {
      console.warn(`[Calendar] Skipping event without date: ${event.title}`);
      continue;
    }

    const eventDate = new Date(event.date);
    if (isNaN(eventDate.getTime())) {
      console.warn(`[Calendar] Invalid date for event: ${event.title}, date: ${event.date}`);
      continue;
    }

    const uid = `${event.id}@piratage.club`;
    
    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const dtstart = formatICSDate(eventDate);
    // Assume 2-hour duration if not specified
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
    const dtend = formatICSDate(endDate);

    // Escape special characters in text fields
    const summary = escapeICSText(event.title || "Piratage Event");
    const description = escapeICSText(
      event.description || "Event organized by Piratage - The Ethical Hacking Club"
    );
    const location = escapeICSText(event.location || event.venue || "TBA");

    ics += "\r\n" + [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:${event.status === "ongoing" ? "CONFIRMED" : "TENTATIVE"}`,
      event.registrationLink ? `URL:${event.registrationLink}` : "",
      "TRANSP:OPAQUE",
      "SEQUENCE:0",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n");
  }

  // ICS footer
  ics += "\r\nEND:VCALENDAR";

  return ics;
}

/**
 * Format date to ICS format: YYYYMMDDTHHMMSSZ
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}
