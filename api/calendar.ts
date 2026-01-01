import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore, isFirestoreEnabled } from './firebase.js';

// Convert Firestore Timestamp / Date / string to Date
function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!isFirestoreEnabled()) {
      return res.status(503).send('Calendar service unavailable - Firestore not configured');
    }

    const db = getFirestore();
    const snapshot = await db.collection('events').get();

    const events = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((event) => !!event.date)
      .sort((a, b) => {
        const aDate = toDate(a.date)?.getTime() ?? Number.POSITIVE_INFINITY;
        const bDate = toDate(b.date)?.getTime() ?? Number.POSITIVE_INFINITY;
        return aDate - bDate;
      });

    const now = new Date();
    const timestamp = formatICSDate(now);

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Piratage Club//Events Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Piratage Events',
      'X-WR-CALDESC:Upcoming events from Piratage - The Ethical Hacking Club',
      'X-WR-TIMEZONE:UTC',
    ].join('\r\n');

    for (const event of events) {
      const eventDate = toDate(event.date);
      if (!eventDate || isNaN(eventDate.getTime())) {
        continue;
      }

      const uid = `${event.id || 'event'}@piratage.club`;
      const dtstart = formatICSDate(eventDate);
      const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
      const dtend = formatICSDate(endDate);

      const summary = escapeICSText(event.title || 'Piratage Event');
      const description = escapeICSText(
        event.description || 'Event organized by Piratage - The Ethical Hacking Club'
      );
      const location = escapeICSText(event.location || event.venue || 'TBA');

      ics += '\r\n' +
        [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${timestamp}`,
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          `LOCATION:${location}`,
          `STATUS:${event.status === 'ongoing' ? 'CONFIRMED' : 'TENTATIVE'}`,
          event.registrationLink ? `URL:${event.registrationLink}` : '',
          'TRANSP:OPAQUE',
          'SEQUENCE:0',
          'END:VEVENT',
        ]
          .filter(Boolean)
          .join('\r\n');
    }

    ics += '\r\nEND:VCALENDAR';

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="piratage-events.ics"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(ics);
  } catch (error) {
    console.error('Calendar generation error:', error);
    res.status(500).send('Error generating calendar');
  }
}
