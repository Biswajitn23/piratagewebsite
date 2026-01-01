import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase";
import emailjs from "@emailjs/nodejs";
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

// Helper to send a welcome/confirmation email via EmailJS.
async function sendWelcomeEmail(email: string, flags: { new?: boolean; reactivated?: boolean; repeat?: boolean }) {
  console.log("📧 Attempting to send welcome email to:", email);
  
  if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
    console.error("❌ EmailJS credentials not set in environment");
    console.error("Required: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY");
    return;
  }
  
  console.log("✅ EmailJS credentials found");
  const appUrl = process.env.APP_URL || 'https://piratageauc.vercel.app';
  
  const subjectBase = flags.reactivated
    ? 'Welcome back to Piratage'
    : flags.repeat
    ? 'You are already subscribed'
    : 'Successfully subscribed to Piratage Event Notifications';
    
  const subtitle = flags.reactivated
    ? 'Your subscription has been reactivated. You will now receive email notifications whenever new events are posted.'
    : flags.repeat
    ? 'You are already subscribed and will continue receiving email notifications for new events.'
    : 'You have successfully subscribed to receive email notifications for new events. Whenever we post a new event, you\'ll get an email with all the details!';

  // EmailJS template parameters - customize these to match your EmailJS template variables
  const templateParams = {
    to_email: email,
    to_name: email.split('@')[0],
    subject: subjectBase + ' 🎉',
    subtitle: subtitle,
    app_url: appUrl,
    logo_url: 'https://piratageauc.vercel.app/piratagelogo.webp',
    whatsapp_link: 'https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G',
    linkedin_link: 'https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/',
    instagram_link: 'https://www.instagram.com/piratage_club_auc/',
    discord_link: 'https://discord.gg/9gZKmd8b',
    year: new Date().getFullYear().toString(),
  };

  try {
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
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
