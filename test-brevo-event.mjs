import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";

// Load env vars from .env and .env.local (if present)
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const {
  SMTP_SERVER,
  SMTP_PORT,
  SMTP_LOGIN,
  SMTP_KEY,
  FROM_EMAIL,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = process.env;

if (!SMTP_SERVER || !SMTP_PORT || !SMTP_LOGIN || !SMTP_KEY) {
  console.error("❌ Missing SMTP configuration in .env or .env.local");
  process.exit(1);
}

const recipient = "nbiswajit978@gmail.com";
const toName = recipient.split("@")[0];

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase initialized via env vars");
  } else {
    console.error("❌ Missing Firebase env vars");
    process.exit(1);
  }
}

const db = admin.firestore();

async function getLatestEvent() {
  const snapshot = await db.collection("events").orderBy("date", "desc").limit(1).get();
  if (snapshot.empty) {
    throw new Error("No events found in Firestore");
  }
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    event_title: data.title || "Event",
    event_date: data.date || "",
    event_time: data.time || "",
    event_location: data.location || "",
    event_description: data.description || "",
    event_cover_url: data.cover_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop",
    event_url: `https://piratageauc.tech/events/${doc.id}`,
    ics_download_url: `https://piratageauc.tech/api/calendar/export-event?id=${doc.id}`,
    unsubscribe_url: `https://piratageauc.tech/api/unsubscribe?token=test-token`,
    logo_url: "https://piratageauc.tech/piratagelogo.webp",
    year: new Date().getFullYear().toString(),
    email: recipient
  };
}

const templatePath = "email-template-event.html";

async function main() {
  let eventData;
  try {
    eventData = await getLatestEvent();
    console.log("Fetched latest event:", eventData.event_title);
  } catch (err) {
    console.error("❌ Failed to fetch event from Firestore:", err);
    process.exit(1);
  }

  let html;
  try {
    html = fs.readFileSync(templatePath, "utf8")
      .replace(/{{to_name}}/g, toName)
      .replace(/{{event_title}}/g, eventData.event_title)
      .replace(/{{event_date}}/g, eventData.event_date)
      .replace(/{{event_time}}/g, eventData.event_time)
      .replace(/{{event_location}}/g, eventData.event_location)
      .replace(/{{event_description}}/g, eventData.event_description)
      .replace(/{{event_cover_url}}/g, eventData.event_cover_url)
      .replace(/{{event_url}}/g, eventData.event_url)
      .replace(/{{ics_download_url}}/g, eventData.ics_download_url)
      .replace(/{{unsubscribe_url}}/g, eventData.unsubscribe_url)
      .replace(/{{logo_url}}/g, eventData.logo_url)
      .replace(/{{year}}/g, eventData.year)
      .replace(/{{email}}/g, eventData.email)
      .replace(/{{subject}}/g, `New Event: ${eventData.event_title}`);
  } catch (err) {
    console.error(`❌ Failed to read template: ${templatePath}`);
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: Number(SMTP_PORT),
    secure: false,
    auth: {
      user: SMTP_LOGIN,
      pass: SMTP_KEY,
    },
  });

  const mailOptions = {
    from: FROM_EMAIL || 'Piratage Club <piratage.auc@gmail.com>',
    to: recipient,
    subject: `New Event: ${eventData.event_title}`,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Failed to send event email:", error);
      process.exit(1);
    } else {
      console.log("✅ Event email sent successfully!");
      console.log("Message ID:", info.messageId);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  });
}

main();
