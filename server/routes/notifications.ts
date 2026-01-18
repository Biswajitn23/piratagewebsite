import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase.js";
// import emailjs from "@emailjs/nodejs";

/**
 * Send email notifications for pending events using Firestore + EmailJS
 */

export async function processPendingNotifications() {
  if (!isFirestoreEnabled()) {
    throw new Error("Email notification service unavailable");
  }

  const db = getFirestore();

  // Get all active subscribers
  const subscribersSnapshot = await db.collection("subscribers").where("is_active", "==", true).get();
  const subscribers = subscribersSnapshot.docs.map(doc => doc.data());

  // Get all pending notifications
  const notificationsSnapshot = await db.collection("email_notifications").where("status", "==", "pending").orderBy("created_at", "asc").limit(10).get();

  let sentCount = 0;
  const results = [];

  for (const notificationDoc of notificationsSnapshot.docs) {
    const notification = notificationDoc.data();
    try {
      await notificationDoc.ref.update({ status: "processing" });

      const eventDoc = await db.collection("events").doc(notification.event_id).get();
      if (!eventDoc.exists) {
        await notificationDoc.ref.update({
          status: "failed",
          error_message: "Event not found"
        });
        continue;
      }
      const event = eventDoc.data();

      const emailPromises = subscribers.map(async (subscriber: any) => {
        const appUrl = process.env.APP_URL || 'https://piratageauc.tech';
        const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`;
        const eventDate = new Date(event!.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Event: ${event!.title}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e0e0e0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #4b0082 0%, #8a2be2 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🚀 New Event from Piratage</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #00ffff; font-size: 24px;">${event!.title}</h2>
                        <div style="background-color: #2a2a2a; border-left: 4px solid #00ffff; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #00ffff;">📅 Date:</strong> ${formattedDate}</p>
                          ${event!.type ? `<p style="margin: 10px 0 0 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #00ffff;">📌 Type:</strong> ${event!.type}</p>` : ''}
                        </div>
                        ${event!.description ? `<div style="margin: 20px 0;"><p style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">${event!.description}</p></div>` : ''}
                        ${event!.coverImage ? `<div style="margin: 20px 0; text-align: center;"><img src="${event!.coverImage}" alt="${event!.title}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #2a2a2a;" /></div>` : ''}
                        ${event!.registrationLink ? `<div style="text-align: center; margin: 30px 0;"><a href="${event!.registrationLink}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Register Now →</a></div>` : ''}
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a2a;">
                          <p style="margin: 0; color: #b0b0b0; font-size: 14px; line-height: 1.6;">
                            Don't miss this opportunity to be part of the Piratage community! Mark your calendar and we'll see you there.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #0f0f0f; padding: 20px 30px; border-top: 1px solid #2a2a2a;">
                        <p style="margin: 0 0 10px 0; color: #808080; font-size: 12px; line-height: 1.5;">
                          You're receiving this because you subscribed to Piratage event notifications.
                        </p>
                        <p style="margin: 0; color: #808080; font-size: 12px;">
                          <a href="${unsubscribeUrl}" style="color: #8a2be2; text-decoration: none;">Unsubscribe</a> | 
                          <a href="${appUrl}" style="color: #8a2be2; text-decoration: none;">Visit Website</a>
                        </p>
                        <p style="margin: 10px 0 0 0; color: #606060; font-size: 11px;">
                          © ${new Date().getFullYear()} Piratage - The Ethical Hacking Club
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        // Send email using Brevo
        try {
          // Import sendWelcomeEmailBrevo dynamically to avoid circular deps
          const { sendWelcomeEmailBrevo } = await import("../lib/brevo.js");
          await sendWelcomeEmailBrevo({
            toEmail: subscriber.email,
            toName: subscriber.email.split('@')[0],
            subject: `🚀 New Event: ${event!.title}`,
            htmlContent: emailHtml,
            senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@piratageauc.tech',
            senderName: process.env.BREVO_SENDER_NAME || 'Piratage Club',
          });
          return { success: true, email: subscriber.email };
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          return { success: false, email: subscriber.email, error };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      const successCount = emailResults.filter(r => r.success).length;
      const failedCount = emailResults.filter(r => !r.success).length;

      if (failedCount === 0) {
        await notificationDoc.ref.update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_to_count: successCount
        });
      } else if (successCount === 0) {
        await notificationDoc.ref.update({
          status: "failed",
          error_message: `Failed to send to all ${failedCount} subscribers`
        });
      } else {
        await notificationDoc.ref.update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_to_count: successCount,
          error_message: `Partially sent: ${failedCount} failed`
        });
      }

      sentCount++;
      results.push({
        eventId: notification.event_id,
        eventTitle: notification.event_title,
        sent: successCount,
        failed: failedCount,
      });
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
      await notificationDoc.ref.update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return {
    message: `Processed ${sentCount} notifications`,
    results,
  };
}

export const sendEventNotifications: RequestHandler = async (_req, res) => {
  try {
    const out = await processPendingNotifications();
    res.status(200).json(out);
  } catch (err: any) {
    console.error("Send notifications error:", err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
};

export const getNotificationStats: RequestHandler = async (req, res) => {
  try {
    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: "Service unavailable" });
    }

    const db = getFirestore();

    const statsSnapshot = await db.collection("email_notifications").get();
    const stats = statsSnapshot.docs.map(doc => doc.data());

    const summary = {
      pending: stats.filter(s => s.status === "pending").length,
      processing: stats.filter(s => s.status === "processing").length,
      sent: stats.filter(s => s.status === "sent").length,
      failed: stats.filter(s => s.status === "failed").length,
      total: stats.length,
    };

    const subscribersSnapshot = await db.collection("subscribers")
      .where("is_active", "==", true)
      .get();

    res.status(200).json({
      notifications: summary,
      activeSubscribers: subscribersSnapshot.size,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
