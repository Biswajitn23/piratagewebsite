import { EventRecordDTO } from "@shared/api";

/**
 * Formats a date to ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generates an ICS (iCalendar) file content from an event
 * @param event The event to convert to ICS format
 * @param method PUBLISH (for new events) or CANCEL (for cancellations)
 * @returns The ICS file content as a string
 */
export function generateICS(event: EventRecordDTO, method: 'PUBLISH' | 'CANCEL' = 'PUBLISH'): string {
  const eventDate = new Date(event.date);
  
  // Check if date is valid
  if (isNaN(eventDate.getTime())) {
    throw new Error('Invalid event date');
  }

  // Event ends 2 hours after start (default)
  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
  
  const now = new Date();
  const uid = `${event.id}@piratage.club`;
  const dtstart = formatICSDate(eventDate);
  const dtend = formatICSDate(endDate);
  const dtstamp = formatICSDate(now);

  const summary = escapeICSText(event.title || 'Piratage Event');
  const description = escapeICSText(
    event.description || 'Event organized by Piratage - The Ethical Hacking Club'
  );
  const location = escapeICSText(event.location || event.venue || 'TBA');

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Piratage Club//Event Notification//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:${event.status === 'ongoing' ? 'CONFIRMED' : 'TENTATIVE'}`,
    'TRANSP:OPAQUE',
    'SEQUENCE:0',
  ];

  // Add registration link if available
  if (event.registrationLink) {
    ics.push(`URL:${event.registrationLink}`);
  }

  // Add organizer
  ics.push('ORGANIZER;CN=Piratage Club:mailto:noreply@piratageauc.tech');

  ics.push('END:VEVENT');
  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}
