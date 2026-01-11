import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const {
  SMTP_SERVER,
  SMTP_PORT,
  SMTP_LOGIN,
  SMTP_KEY,
  FROM_EMAIL
} = process.env;

if (!SMTP_SERVER || !SMTP_PORT || !SMTP_LOGIN || !SMTP_KEY) {
  console.error("❌ Missing SMTP configuration in .env.local");
  process.exit(1);
}

const recipient = "nbiswajit978@gmail.com";
const toName = recipient.split("@")[0];

// Event details (replace with real data as needed)
const eventData = {
  event_title: "Cybersecurity Bootcamp 2026",
  event_date: "January 20, 2026",
  event_time: "10:00 AM - 4:00 PM",
  event_location: "Auditorium, Piratage Campus",
  event_description: "Join us for a full-day bootcamp covering advanced cybersecurity topics, hands-on labs, and expert talks.",
  event_cover_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop",
  event_url: "https://piratageauc.vercel.app/events",
  ics_download_url: "https://piratageauc.vercel.app/api/calendar/export-event?id=cyber-bootcamp-2026",
  unsubscribe_url: "https://piratageauc.vercel.app/api/unsubscribe?token=test-token",
  logo_url: "https://piratageauc.vercel.app/piratagelogo.webp",
  year: new Date().getFullYear().toString(),
  email: recipient
};

// Read the HTML template
const templatePath = "email-template-event.html";
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
