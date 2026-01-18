import "dotenv/config";
import { RequestHandler } from "express";
import { getFirestore, isFirestoreEnabled } from "../firebase.js";
// import brevo/sendinblue integration here (to be added)
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import axios from "axios";
import { sendWelcomeEmailBrevo } from "../lib/brevo.js";

// Helper function to verify hCaptcha token
async function verifyHCaptcha(token: string): Promise<boolean> {
  // Bypass hCaptcha in development or if SKIP_HCAPTCHA is set
  if (process.env.NODE_ENV === "development" || process.env.SKIP_HCAPTCHA === "true") {
    console.log("⚠️ Skipping hCaptcha verification in development mode or due to SKIP_HCAPTCHA");
    return true;
  }
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
    const { email, captchaToken, name } = req.body;

    if (!email || !email.includes("@")) {
      console.log("❌ Invalid email:", email);
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Verify hCaptcha if provided
    if (captchaToken) {
      console.log("🔍 Verifying hCaptcha token...");
      const isCaptchaValid = await verifyHCaptcha(captchaToken);
      
      if (!isCaptchaValid) {
        console.log("❌ Invalid captcha token");
        return res.status(400).json({ error: "Captcha verification failed. Please try again." });
      }

      console.log("✅ Captcha verified successfully");
    } else {
      console.log("⚠️ No captcha token provided, skipping verification");
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
        console.log("ℹ️ Already subscribed in DB for email:", email);
        return res.status(200).json({ message: "Already subscribed" });
      } else {
        // Reactivate subscription
        try {
          await snapshot.docs[0].ref.update({ 
            is_active: true, 
            subscribed_at: Timestamp.now(),
            name: name || snapshot.docs[0].data().name || ''
          });
          console.log("🔄 Reactivated subscription for email:", email);
        } catch (error) {
          console.error("Error reactivating subscription:", error);
          return res.status(500).json({ error: "Failed to reactivate subscription" });
        }
        // No email on reactivation - only for new subscriptions
        return res.status(200).json({ message: "Subscription reactivated" });
      }
    }

    // New subscription
    console.log("🆕 Creating new subscriber in DB for email:", email);
    let subscriberId: string;
    try {
      subscriberId = randomUUID();
      await db.collection("subscribers").doc(subscriberId).set({
        id: subscriberId,
        email: email.toLowerCase(),
        name: name || '',
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
      await sendWelcomeEmail(email.toLowerCase(), name || undefined, { new: true });
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


// Helper to send a welcome/confirmation email via Brevo (Sendinblue)
async function sendWelcomeEmail(email: string, providedName?: string, flags?: { new?: boolean; reactivated?: boolean; repeat?: boolean }) {
  const toName = providedName || email.split('@')[0];
  const subjectBase = flags.reactivated
    ? `Welcome back to Piratage: The Ethical Hacking Club, ${toName}`
    : flags.repeat
    ? 'You are already subscribed'
    : `Welcome to Piratage: The Ethical Hacking Club, ${toName}`;
  const appUrl = process.env.APP_URL || 'https://piratageauc.tech';
  const htmlContent = `
    <h1>Welcome to Piratage, ${toName}!</h1>
    <p>Your registration for <strong>${email}</strong> is complete. You are now on the list for priority alerts, exclusive workshops, and deep-dive technical sessions.</p>
    <p>Visit our <a href="${appUrl}">website</a> or join our <a href="https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G">WhatsApp</a> group.</p>
    <p>Stay Curious. Stay Ethical.<br/>Piratage Team</p>
  `;
  const senderEmail = process.env.FROM_EMAIL || 'piratage.auc@gmail.com';
  const senderName = 'Piratage Club';
  return sendWelcomeEmailBrevo({
    toEmail: email,
    toName,
    subject: subjectBase,
    htmlContent,
    senderEmail,
    senderName
  });
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
