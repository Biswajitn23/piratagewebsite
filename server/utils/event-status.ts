import { EventRecordDTO } from "@shared/api";

/**
 * Determines the status of an event based on current date/time
 * @param eventDate The event date as a string or Date
 * @param eventEndTime Optional end time (defaults to 2 hours after start)
 * @returns 'upcoming', 'ongoing', or 'past'
 */
export function getEventStatus(
  eventDate: string | Date,
  eventEndTime?: string | Date
): EventRecordDTO["status"] {
  try {
    const now = new Date();
    const startDate = new Date(eventDate);

    // Invalid date check
    if (isNaN(startDate.getTime())) {
      return "past";
    }

    // If no end time provided, assume 2 hours duration
    const endDate = eventEndTime
      ? new Date(eventEndTime)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    // Event hasn't started yet
    if (now < startDate) {
      return "upcoming";
    }

    // Event is currently happening
    if (now >= startDate && now <= endDate) {
      return "ongoing";
    }

    // Event has ended
    return "past";
  } catch (error) {
    console.error("[Event Status] Error computing status:", error);
    return "past";
  }
}

/**
 * Normalizes event status based on explicit status or computed from date
 * @param event Event with optional status field
 * @returns The correct status for the event
 */
export function normalizeEventStatus(event: any): EventRecordDTO["status"] {
  // If explicit status is provided and valid, use it (but override if time has passed)
  const explicit = (event.status || event.Status || "")
    .toString()
    .trim()
    .toLowerCase();

  if (
    explicit === "ongoing" ||
    explicit === "upcoming" ||
    explicit === "past"
  ) {
    // Still compute based on actual time to avoid stale data
    const computedStatus = getEventStatus(event.date, event.endTime);
    return computedStatus;
  }

  // Otherwise compute from date
  return getEventStatus(event.date, event.endTime);
}
