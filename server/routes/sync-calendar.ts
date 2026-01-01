import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase.js";
import { EventRecordDTO } from "@shared/api";

/**
 * Sync all existing events to authenticated Google Calendar users
 * This is useful for retroactively adding events that existed before calendar automation
 */
export const syncEventsToCalendar: RequestHandler = async (req, res) => {
  if (!isFirestoreEnabled()) {
    return res.status(503).json({ error: "Firestore not configured" });
  }

  try {
    const db = getFirestore();

    // Fetch all events
    const eventsSnapshot = await db.collection("events").get();
    if (eventsSnapshot.empty) {
      return res.status(200).json({ message: "No events found", synced: 0 });
    }

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL || "http://localhost:5173";

    // Fetch all authenticated Google Calendar users
    const usersSnapshot = await db.collection("google_calendar_users").get();
    if (usersSnapshot.empty) {
      return res.status(200).json({ message: "No authenticated users found", synced: 0 });
    }

    const userEmails = usersSnapshot.docs.map((doc) => doc.id);
    const events = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<EventRecordDTO, "id">),
    }));

    console.log(`[Sync Calendar] Starting sync: ${events.length} events, ${userEmails.length} users`);

    let totalSynced = 0;
    let totalFailed = 0;

    // For each event, add to each user's calendar
    for (const event of events) {
      for (const userEmail of userEmails) {
        try {
          const response = await fetch(`${baseUrl}/api/calendar/add-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, eventId: event.id }),
          });

          if (response.ok) {
            console.log(`[Sync Calendar] ✓ Added event ${event.id} to ${userEmail}`);
            totalSynced++;
          } else {
            const error = await response.json();
            console.warn(`[Sync Calendar] ✗ Failed to add event ${event.id} to ${userEmail}:`, error.error);
            totalFailed++;
          }
        } catch (error) {
          console.error(`[Sync Calendar] ✗ Error syncing event ${event.id} to ${userEmail}:`, error);
          totalFailed++;
        }
      }
    }

    res.status(200).json({
      message: "Calendar sync completed",
      eventsCount: events.length,
      usersCount: userEmails.length,
      synced: totalSynced,
      failed: totalFailed,
    });
  } catch (error) {
    console.error("[Sync Calendar] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
