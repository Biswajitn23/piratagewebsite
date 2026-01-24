import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";
import readline from "readline";

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

async function getEvents() {
  const snapshot = await db.collection("events").orderBy("date", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getSubscribers() {
  const snapshot = await db.collection("subscribers").get();
  return snapshot.docs.map(doc => doc.data().email).filter(Boolean);
}

function renderTemplate(eventData, recipient) {
  const templatePath = "email-template-event.html";
  let html = fs.readFileSync(templatePath, "utf8")
    // Support Brevo/Liquid style for first name fallback
    .replace(/{{\s*contact\.FIRSTNAME\s*\|\s*default:\s*"([^"]*)"\s*}}/g, (_, def) => {
      const name = recipient.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1) || def || "Member";
    })
    .replace(/{{to_name}}/g, recipient.split("@")[0])
    .replace(/{{event_title}}/g, eventData.title || "Event")
    .replace(/{{event_date}}/g, eventData.date || "")
    .replace(/{{event_time}}/g, eventData.time || "")
    .replace(/{{event_location}}/g, eventData.location || "")
    .replace(/{{event_description}}/g, eventData.description || "")
    .replace(/{{event_cover_url}}/g, eventData.cover_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop")
    .replace(/{{event_url}}/g, `https://piratageauc.tech/events/${eventData.id}`)
    .replace(/{{ics_download_url}}/g, `https://piratageauc.tech/api/calendar/export-event?id=${eventData.id}`)
    .replace(/{{unsubscribe_url}}/g, `https://piratageauc.tech/api/unsubscribe?token=test-token`)
    .replace(/{{logo_url}}/g, "https://piratageauc.tech/piratagelogo.webp")
    // Support Liquid style year: {{ "now" | date: "%Y" }}
    .replace(/{{\s*"now"\s*\|\s*date:\s*"%Y"\s*}}/g, new Date().getFullYear().toString())
    .replace(/{{year}}/g, new Date().getFullYear().toString())
    .replace(/{{email}}/g, recipient)
    // Subject for in-template use
    .replace(/{{subject}}/g, `Upcoming Event: ${eventData.title || "Event"} – Details Inside`);
  return html;
}

async function sendMail(eventData, recipient) {
  const html = renderTemplate(eventData, recipient);
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
    from: FROM_EMAIL || 'noreply@piratageauc.tech',
    to: recipient,
    subject: `Upcoming Event: ${eventData.title} – Details Inside`,
    html,
  };
  return transporter.sendMail(mailOptions);
}

async function main() {
  const events = await getEvents();
  if (!events.length) {
    console.log("No events found.");
    return;
  }
  console.log("Select an event to send:");
  events.forEach((e, i) => {
    console.log(`${i + 1}. ${e.title} (${e.date})`);
  });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Enter event number: ", async (answer) => {
    const idx = parseInt(answer) - 1;
    if (isNaN(idx) || idx < 0 || idx >= events.length) {
      console.log("Invalid selection.");
      rl.close();
      return;
    }
    const eventData = events[idx];
    const subscribers = await getSubscribers();
    if (!subscribers.length) {
      console.log("No subscribers found.");
      rl.close();
      return;
    }
    console.log(`Sending event '${eventData.title}' to ${subscribers.length} subscribers...`);
    let sent = 0, failed = 0;
    for (const email of subscribers) {
      try {
        await sendMail(eventData, email);
        sent++;
        process.stdout.write(".");
      } catch (e) {
        failed++;
        process.stdout.write("x");
      }
    }
    console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
    rl.close();
  });
}

main();
