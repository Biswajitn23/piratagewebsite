import { RequestHandler } from "express";
import { getSupabase, isSupabaseEnabled } from "../supabase";

/**
 * Send email notifications for pending events using Supabase + Resend
 * 
 * Setup:
 * 1. Sign up at resend.com and get API key
 * 2. Add RESEND_API_KEY to your .env file
 * 3. Install resend: pnpm add resend
 * 4. Verify your sending domain in Resend dashboard
 */

// Import Resend if available
let Resend: any;
try {
  const resendModule = require('resend');
  Resend = resendModule.Resend;
} catch (e) {
  console.warn('Resend not installed. Run: pnpm add resend');
}

export const sendEventNotifications: RequestHandler = async (req, res) => {
  try {
    if (!isSupabaseEnabled()) {
      return res.status(503).json({ error: "Email notification service unavailable" });
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(503).json({ 
        error: "Email service not configured. Add RESEND_API_KEY to .env file" 
      });
    }

    if (!Resend) {
      return res.status(503).json({ 
        error: "Resend not installed. Run: pnpm add resend" 
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = getSupabase();

    // Get pending notifications
    const { data: notifications, error: notifError } = await supabase
      .from("email_notifications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10); // Process 10 at a time

    if (notifError) {
      console.error("Error fetching notifications:", notifError);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({ message: "No pending notifications" });
    }

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("is_active", true);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      return res.status(500).json({ error: "Failed to fetch subscribers" });
    }

    let sentCount = 0;
    const results = [];

    for (const notification of notifications) {
      try {
        // Mark as processing
        await supabase
          .from("email_notifications")
          .update({ status: "processing" })
          .eq("id", notification.id);

        // Get event details
        const { data: event } = await supabase
          .from("events")
          .select("*")
          .eq("id", notification.event_id)
          .single();

        if (!event) {
          await supabase
            .from("email_notifications")
            .update({ 
              status: "failed", 
              error_message: "Event not found" 
            })
            .eq("id", notification.id);
          continue;
        }

        // Send emails to all subscribers using Resend
        const emailPromises = (subscribers || []).map(async (subscriber) => {
          const appUrl = process.env.APP_URL || 'http://localhost:8080';
          const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`;
          
          const eventDate = new Date(event.date);
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
              <title>New Event: ${event.title}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e0e0e0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #4b0082 0%, #8a2be2 100%); padding: 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🚀 New Event from Piratage</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="margin: 0 0 20px 0; color: #00ffff; font-size: 24px;">${event.title}</h2>
                          
                          <div style="background-color: #2a2a2a; border-left: 4px solid #00ffff; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #00ffff;">📅 Date:</strong> ${formattedDate}</p>
                            ${event.type ? `<p style="margin: 10px 0 0 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #00ffff;">📌 Type:</strong> ${event.type}</p>` : ''}
                          </div>
                          
                          ${event.description ? `
                            <div style="margin: 20px 0;">
                              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">${event.description}</p>
                            </div>
                          ` : ''}
                          
                          ${event.coverImage ? `
                            <div style="margin: 20px 0; text-align: center;">
                              <img src="${event.coverImage}" alt="${event.title}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #2a2a2a;" />
                            </div>
                          ` : ''}
                          
                          ${event.registrationLink ? `
                            <div style="text-align: center; margin: 30px 0;">
                              <a href="${event.registrationLink}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Register Now →</a>
                            </div>
                          ` : ''}
                          
                          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a2a;">
                            <p style="margin: 0; color: #b0b0b0; font-size: 14px; line-height: 1.6;">
                              Don't miss this opportunity to be part of the Piratage community! Mark your calendar and we'll see you there.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
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

          try {
            await resend.emails.send({
              from: process.env.FROM_EMAIL || 'Piratage <notifications@piratage.club>',
              to: subscriber.email,
              subject: `🚀 New Event: ${event.title}`,
              html: emailHtml,
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

        // Mark as sent or failed
        if (failedCount === 0) {
          await supabase
            .from("email_notifications")
            .update({ 
              status: "sent", 
              sent_at: new Date().toISOString(),
              sent_to_count: successCount
            })
            .eq("id", notification.id);
        } else if (successCount === 0) {
          await supabase
            .from("email_notifications")
            .update({ 
              status: "failed", 
              error_message: `Failed to send to all ${failedCount} subscribers` 
            })
            .eq("id", notification.id);
        } else {
          await supabase
            .from("email_notifications")
            .update({ 
              status: "sent", 
              sent_at: new Date().toISOString(),
              sent_to_count: successCount,
              error_message: `Partially sent: ${failedCount} failed`
            })
            .eq("id", notification.id);
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
        await supabase
          .from("email_notifications")
          .update({ 
            status: "failed", 
            error_message: error instanceof Error ? error.message : "Unknown error" 
          })
          .eq("id", notification.id);
      }
    }

    res.status(200).json({
      message: `Processed ${sentCount} notifications`,
      results,
    });
  } catch (error) {
    console.error("Send notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get email notification statistics
 */
export const getNotificationStats: RequestHandler = async (req, res) => {
  try {
    if (!isSupabaseEnabled()) {
      return res.status(503).json({ error: "Service unavailable" });
    }

    const supabase = getSupabase();

    const { data: stats } = await supabase
      .from("email_notifications")
      .select("status");

    const summary = {
      pending: stats?.filter(s => s.status === "pending").length || 0,
      processing: stats?.filter(s => s.status === "processing").length || 0,
      sent: stats?.filter(s => s.status === "sent").length || 0,
      failed: stats?.filter(s => s.status === "failed").length || 0,
      total: stats?.length || 0,
    };

    const { data: subscriberCount } = await supabase
      .from("subscribers")
      .select("id", { count: "exact" })
      .eq("is_active", true);

    res.status(200).json({
      notifications: summary,
      activeSubscribers: subscriberCount?.length || 0,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
