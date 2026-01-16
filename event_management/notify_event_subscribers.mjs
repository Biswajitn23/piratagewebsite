// Utility to send event update emails to all subscribers using Brevo template 2
import "dotenv/config";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { sendWelcomeEmailBrevo } from "../server/lib/brevo.js";

// Load Firebase credentials
const serviceAccount = JSON.parse(
  readFileSync("./piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json", "utf8")
);

// Initialize Firebase Admin
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch {}
const db = getFirestore();

export async function notifySubscribersOfEvent(event) {
  const subscribersSnap = await db.collection("subscribers").where("is_active", "==", true).get();
  if (subscribersSnap.empty) {
    console.log("No active subscribers to notify.");
    return;
  }
  const promises = [];
  for (const doc of subscribersSnap.docs) {
    const email = doc.data().email;
    if (!email) continue;
    promises.push(
      sendWelcomeEmailBrevo({
        toEmail: email,
        toName: email,
        subject: undefined,
        htmlContent: undefined,
        senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@piratage.com",
        senderName: "Piratage Team",
        templateId: 2,
        params: {
          EVENT_NAME: event.title,
          EVENT_DATE: event.date,
          EVENT_DESCRIPTION: event.description,
          EVENT_LOCATION: event.location,
          EVENT_LINK: event.registrationLink || "",
        },
      })
    );
  }
  await Promise.all(promises);
  console.log(`Notified ${promises.length} subscribers about event: ${event.title}`);
}
