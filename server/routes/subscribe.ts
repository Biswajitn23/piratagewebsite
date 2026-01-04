import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase.js";
import emailjs from "@emailjs/nodejs";
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import axios from "axios";

// Helper function to verify hCaptcha token
async function verifyHCaptcha(token: string): Promise<boolean> {
  try {
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) {
      console.error("❌ HCAPTCHA_SECRET not set in environment");
      return false;
    }

    const response = await axios.post(
      "https://hcaptcha.com/siteverify",
      new URLSearchParams({
        secret: secret,
        response: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.success === true;
  } catch (error) {
    console.error("❌ hCaptcha verification error:", error);
    return false;
  }
}

export const subscribeEmail: RequestHandler = async (req, res) => {
  console.log("🔵 Subscribe endpoint called with body:", req.body);
  try {
    const { email, captchaToken } = req.body;

    if (!email || !email.includes("@")) {
      console.log("❌ Invalid email:", email);
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Verify hCaptcha
    if (!captchaToken) {
      console.log("❌ No captcha token provided");
      return res.status(400).json({ error: "Captcha verification required" });
    }

    console.log("🔍 Verifying hCaptcha token...");
    const isCaptchaValid = await verifyHCaptcha(captchaToken);
    
    if (!isCaptchaValid) {
      console.log("❌ Invalid captcha token");
      return res.status(400).json({ error: "Captcha verification failed. Please try again." });
    }

    console.log("✅ Captcha verified successfully");
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
        // Already subscribed - no email, just acknowledge
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

        // No email on reactivation - only for new subscriptions
        return res.status(200).json({ message: "Subscription reactivated" });
      }
    }

    // New subscription
    let subscriberId: string;
    try {
      subscriberId = randomUUID();
      await db.collection("subscribers").doc(subscriberId).set({
        id: subscriberId,
        email: email.toLowerCase(),
        subscribed_at: Timestamp.now(),
        is_active: true,
        unsubscribe_token: randomUUID()
      });
      console.log("✅ Subscriber saved to Firestore:", subscriberId);
    } catch (error) {
      console.error("Error subscribing email:", error);
      return res.status(500).json({ error: "Failed to subscribe" });
    }

    // Send welcome email synchronously (wait for completion)
    try {
      await sendWelcomeEmail(email.toLowerCase(), { new: true });
      console.log("✅ Welcome email sent successfully to:", email);
      res.status(201).json({ message: "Successfully subscribed. Check your email for confirmation!" });
    } catch (error: any) {
      console.error("❌ Welcome email failed but subscription was saved:", error?.message || error);
      // Still return success since subscription was saved, but log the error
      res.status(201).json({ 
        message: "Subscribed, but welcome email may be delayed. Please check your inbox and spam folder.",
        warning: true 
      });
    }
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper to send a welcome/confirmation email via EmailJS.
async function sendWelcomeEmail(email: string, flags: { new?: boolean; reactivated?: boolean; repeat?: boolean }) {
  console.log("📧 Attempting to send welcome email to:", email);
  
  // Validate credentials
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    console.error("❌ EmailJS credentials missing:");
    console.error("  - SERVICE_ID:", EMAILJS_SERVICE_ID ? "✓" : "✗");
    console.error("  - TEMPLATE_ID:", EMAILJS_TEMPLATE_ID ? "✓" : "✗");
    console.error("  - PUBLIC_KEY:", EMAILJS_PUBLIC_KEY ? "✓" : "✗");
    console.error("  - PRIVATE_KEY:", EMAILJS_PRIVATE_KEY ? "✓" : "✗");
    throw new Error("EmailJS credentials not configured");
  }
  
  console.log("✅ All EmailJS credentials are configured");
  const appUrl = process.env.APP_URL || 'https://piratageauc.vercel.app';
  
  const subjectBase = flags.reactivated
    ? 'Welcome back to Piratage'
    : flags.repeat
    ? 'You are already subscribed'
    : 'Welcome to Piratage: The Ethical Hacking Club';
    
  // EmailJS template parameters - customize these to match your EmailJS template variables
  const templateParams = {
    email: email,
    to_email: email,
    recipient_email: email,
    user_email: email,
    to_name: email.split('@')[0],
    subject: subjectBase,
    app_url: appUrl,
    logo_url: 'https://piratageauc.vercel.app/piratagelogo.webp',
    whatsapp_link: 'https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G',
    linkedin_link: 'https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/',
    instagram_link: 'https://www.instagram.com/piratage_club_auc/',
    discord_link: 'https://discord.gg/9gZKmd8b',
    year: new Date().getFullYear().toString(),
  };

  console.log("📨 Email template params:", {
    to_email: templateParams.to_email,
    subject: templateParams.subject,
  });

  try {
    console.log("🔄 Sending email via EmailJS...");
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );
    console.log("✅ Email sent successfully. Response ID:", result.status);
    return result;
  } catch (error: any) {
    console.error("❌ Failed to send email. Error details:");
    console.error("  - Message:", error?.message);
    console.error("  - Status:", error?.status);
    console.error("  - Response:", error?.response);
    throw new Error(`EmailJS error: ${error?.message || 'Unknown error'}`);
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
