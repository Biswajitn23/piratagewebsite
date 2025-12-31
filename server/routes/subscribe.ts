import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

export const subscribeEmail: RequestHandler = async (req, res) => {
  console.log("🔵 Subscribe endpoint called with body:", req.body);
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      console.log("❌ Invalid email:", email);
      return res.status(400).json({ error: "Valid email is required" });
    }
    
    console.log("✅ Valid email received:", email);

    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: "Email subscription service unavailable" });
    }

    const db = getFirestore();

    // Check if already subscribed
    const snapshot = await db.collection("subscribers")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    
    const existing = !snapshot.empty ? snapshot.docs[0].data() : null;

    if (existing) {
      if (existing.is_active) {
        // Optional: send a gentle confirmation (non-blocking)
        sendWelcomeEmail(email.toLowerCase(), { repeat: true }).catch(() => {});
        return res.status(200).json({ message: "Already subscribed" });
      } else {
        // Reactivate subscription
        try {
          await snapshot.docs[0].ref.update({ 
            is_active: true, 
            subscribed_at: Timestamp.now() 
          });
        } catch (error) {
          console.error("Error reactivating subscription:", error);
          return res.status(500).json({ error: "Failed to reactivate subscription" });
        }

        // Fire welcome email asynchronously
        sendWelcomeEmail(email.toLowerCase(), { reactivated: true }).catch((e: any) => {
          console.error("❌ Welcome email failed (reactivation):", e?.message || e);
        });
        return res.status(200).json({ message: "Subscription reactivated" });
      }
    }

    // New subscription
    try {
      const subscriberId = randomUUID();
      await db.collection("subscribers").doc(subscriberId).set({
        id: subscriberId,
        email: email.toLowerCase(),
        subscribed_at: Timestamp.now(),
        is_active: true,
        unsubscribe_token: randomUUID()
      });
    } catch (error) {
      console.error("Error subscribing email:", error);
      return res.status(500).json({ error: "Failed to subscribe" });
    }

    // Send welcome email asynchronously (non-blocking)
    sendWelcomeEmail(email.toLowerCase(), { new: true }).catch((e: any) => {
      console.error("❌ Welcome email failed (new):", e?.message || e, e);
    });

    res.status(201).json({ message: "Successfully subscribed" });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper to send a welcome/confirmation email via Resend.
async function sendWelcomeEmail(email: string, flags: { new?: boolean; reactivated?: boolean; repeat?: boolean }) {
  console.log("📧 Attempting to send welcome email to:", email);
  
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not set in environment");
    return;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("✅ Resend initialized");
  const appUrl = process.env.APP_URL || 'http://localhost:8080';
  
  const subjectBase = flags.reactivated
    ? 'Welcome back to Piratage'
    : flags.repeat
    ? 'You are already subscribed'
    : 'Successfully subscribed to Piratage Event Notifications 🎉';
    
  const subtitle = flags.reactivated
    ? 'Your subscription has been reactivated. You will now receive email notifications whenever new events are posted.'
    : flags.repeat
    ? 'You are already subscribed and will continue receiving email notifications for new events.'
    : 'You have successfully subscribed to receive email notifications for new events. Whenever we post a new event, you\'ll get an email with all the details!';

  // ============================================
  // CUSTOMIZE YOUR EMAIL HTML BELOW
  // ============================================
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Piratage Subscription Confirmed</title>
</head>

<body style="margin:0; padding:0; background-color:#0b0f14; font-family: 'Courier New', monospace;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1623; border:1px solid #1f2937; border-radius:10px; margin:30px 0;">

          <!-- Header -->
          <tr>
            <td style="padding:30px; text-align:center; color:#22c55e;">
              <img src="/piratagelogo.webp" alt="Piratage Logo" style="max-width:120px; margin-bottom:15px;" />
              <h1 style="margin:0; font-size:28px; letter-spacing:1px;">
                ✔ ACCESS GRANTED
              </h1>
              <p style="margin-top:10px; color:#9ca3af;">
                Subscription Successful
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 30px 30px; color:#e5e7eb;">
              <p style="font-size:15px; line-height:1.6;">
                You have successfully subscribed to
                <strong style="color:#22c55e;">Piratage Event Notifications</strong>.
              </p>

              <p style="font-size:15px; line-height:1.6;">
                From now on, you’ll receive updates about:
              </p>

              <ul style="color:#9ca3af; font-size:14px; line-height:1.8;">
                <li>Cybersecurity Workshops</li>
                <li>Ethical Hacking Events</li>
                <li>Community Announcements</li>
              </ul>

              <p style="font-size:14px; color:#6b7280;">
                Stay curious. Stay ethical.
              </p>
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="${appUrl}"
                 style="background:#22c55e; color:#0b0f14; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:bold; margin-right:10px; display:inline-block;">
                Visit Website
              </a>

              <a href="https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G"
                 style="background:#16a34a; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:bold; display:inline-block;">
                Join WhatsApp Group
              </a>
            </td>
          </tr>

          <!-- Social Media -->
          <tr>
            <td align="center" style="padding:10px 30px 30px; border-top:1px dashed #1f2937;">
              <p style="color:#9ca3af; font-size:13px; margin-bottom:12px;">
                Connect with PIRATAGE
              </p>

              <a href="https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/" style="color:#22c55e; margin:0 10px; text-decoration:none;">LinkedIn</a>
              <a href="https://www.instagram.com/piratage_club_auc/" style="color:#22c55e; margin:0 10px; text-decoration:none;">Instagram</a>
              <a href="https://discord.gg/9gZKmd8b" style="color:#22c55e; margin:0 10px; text-decoration:none;">Discord</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 30px; font-size:12px; color:#6b7280; text-align:center; border-top:1px solid #1f2937;">
              <p style="margin:0 0 8px;">
                If this wasn’t you, you can safely ignore this message.
              </p>

              <p style="margin:0;">
                © ${new Date().getFullYear()} Piratage : The Ethical Hacking Club
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Piratage <onboarding@resend.dev>',
      to: email,
      subject: subjectBase + ' 🎉',
      html,
    });
    console.log("✅ Email sent successfully:", result);
  } catch (error: any) {
    console.error("❌ Failed to send email:", error?.message || error);
    throw error;
  }
}

export const unsubscribeEmail: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Unsubscribe token is required" });
    }

    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: "Email subscription service unavailable" });
    }

    const db = getFirestore();

    try {
      const snapshot = await db.collection("subscribers")
        .where("unsubscribe_token", "==", token)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      await snapshot.docs[0].ref.update({ is_active: false });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return res.status(500).json({ error: "Failed to unsubscribe" });
    }

    res.status(200).json({ message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
