// Utility to send event update emails to all subscribers using Brevo template 2
import "dotenv/config";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { sendWelcomeEmailBrevo } from "../server/lib/brevo.js";

// Load Firebase credentials (support file or FIREBASE_* env vars)
let serviceAccount;
try {
  const raw = readFileSync("./piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json", "utf8");
  serviceAccount = JSON.parse(raw);
  console.log('Using local Firebase service account file');
} catch (err) {
  // Fallback to environment variables
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
    console.log('Firebase service account file not found — using FIREBASE_* env vars');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };
  } else {
    console.warn('No Firebase credentials found (file or FIREBASE_* envs). Event notifier will fail to read subscribers.');
  }
}

// Initialize Firebase Admin if we have credentials
if (serviceAccount) {
  try {
    initializeApp({ credential: cert(serviceAccount) });
    console.log('✅ Firebase admin initialized (notify_event_subscribers)');
  } catch (e) {
    console.error('Failed to initialize Firebase admin:', e?.message || e);
  }
}
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
    const unsubscribeToken = doc.data().unsubscribe_token || '';
    if (!email) continue;
    promises.push(
      sendWelcomeEmailBrevo({
        toEmail: email,
        toName: email.split('@')[0],
        subject: undefined,
        htmlContent: undefined,
        senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@piratageauc.tech",
        senderName: "Piratage Team",
        templateId: 2,
        params: {
          event_title: event.title,
          event_date: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          event_time: new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event_description: event.description || '',
          event_location: event.location || '',
          event_url: event.registrationLink || '',
          event_cover_url: event.coverImage || '',
          ics_download_url: (process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech') + `/api/download-ics?eventId=${event.id}`,
          to_name: email.split('@')[0],
          email: email,
          unsubscribe_url: unsubscribeToken ? ((process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech') + `/api/unsubscribe?token=${unsubscribeToken}`) : '',
          discord_link: process.env.DISCORD_LINK || 'https://discord.gg/BYcgdwHPYu',
          year: new Date().getFullYear().toString(),
        },
      })
    );
  }
  await Promise.all(promises);
  console.log(`Notified ${promises.length} subscribers about event: ${event.title}`);
}
