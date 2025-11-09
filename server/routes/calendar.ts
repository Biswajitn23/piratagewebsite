import { RequestHandler } from "express";
import { getSupabase, isSupabaseEnabled } from "../supabase";

/**
 * Generate an iCalendar (.ics) file from Supabase events
 * This allows users to subscribe to the calendar in their calendar apps
 */
export const handleCalendar: RequestHandler = async (req, res) => {
  try {
    if (!isSupabaseEnabled()) {
      return res.status(503).send("Calendar service unavailable - Supabase not configured");
    }

    const supabase = getSupabase();
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .in("status", ["upcoming", "ongoing"]) // Only include upcoming and ongoing events
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events for calendar:", error);
      return res.status(500).send("Error generating calendar");
    }

    // Generate iCalendar format
    const icsContent = generateICS(events || []);

    // Set headers for .ics file download
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="piratage-events.ics"');
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
    const eventDate = new Date(event.date);
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
