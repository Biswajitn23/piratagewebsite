import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase.js";
import { EventRecordDTO } from "@shared/api";
// import Brevo email sending utility here when ready
import { generateICS } from "../utils/ics-generator.js";

/**
 * Send event notification emails with calendar invite link to all active subscribers
 */
export const sendEventInvites: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: "Service unavailable - Firestore not configured" });
    }

    // TODO: Add brevo credential checks if needed

    const db = getFirestore();

    // Fetch the event
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event: EventRecordDTO = { id: eventDoc.id, ...eventDoc.data() } as EventRecordDTO;

    // Fetch all active subscribers
    const subscribersSnapshot = await db.collection("subscribers")
      .where("is_active", "==", true)
      .get();

    if (subscribersSnapshot.empty) {
      return res.status(200).json({ 
        message: "No active subscribers found", 
        sent: 0 
      });
    }

    const subscribers = subscribersSnapshot.docs.map(doc => doc.data().email);

    // Validate ICS generation
    let icsContent: string;
    try {
      icsContent = generateICS(event);
    } catch (error: any) {
      console.error("❌ Failed to generate ICS:", error?.message || error);
      return res.status(500).json({ error: "Failed to generate calendar invite" });
    }

    const appUrl = process.env.APP_URL || 'https://piratageauc.tech';
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

    console.log(`📧 Sending event invites for "${event.title}" to ${subscribers.length} subscribers`);

    let successCount = 0;
    let failCount = 0;

    // Send emails to all subscribers
    for (const email of subscribers) {
      try {
        const templateParams = {
          to_email: email,
          to_name: email.split('@')[0],
          subject: `New Event: ${event.title} 📅`,
          event_title: event.title,
          event_date: formattedDate,
          event_time: formattedTime,
          event_location: event.location || event.venue || 'TBA',
          event_description: event.description || 'No description provided',
          event_url: event.registrationLink || `${appUrl}/#events`,
          ics_download_url: icsDownloadUrl,
          app_url: appUrl,
          logo_url: 'https://piratageauc.tech/piratagelogo.webp',
          year: new Date().getFullYear().toString(),
        };


        // TODO: Send email using Brevo API here
        // await sendBrevoEmail({
        //   to: email,
        //   subject: templateParams.subject,
        //   html: ...
        // });

        // For now, just log as if sent
        console.log(`[MOCK] Would send invite to ${email}`);

        console.log(`✅ Sent invite to ${email}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to send invite to ${email}:`, error?.message || error);
        failCount++;
      }

      // Add small delay to avoid rate limiting (optional)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Event invites sent: ${successCount} success, ${failCount} failed`);

    res.status(200).json({
      message: "Event invites sent",
      event: event.title,
      total: subscribers.length,
      sent: successCount,
      failed: failCount,
    });
  } catch (error: any) {
    console.error("❌ Error sending event invites:", error?.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Download event as .ics file
 */
export const downloadEventICS: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: "eventId is required" });
    }

    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: "Service unavailable" });
    }

    const db = getFirestore();
    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event: EventRecordDTO = { id: eventDoc.id, ...eventDoc.data() } as EventRecordDTO;

    const icsContent = generateICS(event);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug || event.id}.ics"`);
    res.setHeader('Content-Length', Buffer.byteLength(icsContent));

    res.send(icsContent);
  } catch (error: any) {
    console.error("❌ Error downloading ICS:", error?.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
