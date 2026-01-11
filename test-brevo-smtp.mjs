import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
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

// Read the HTML template
const templatePath = "email-template-welcome.html";
let html;
try {
  html = fs.readFileSync(templatePath, "utf8")
    .replace(/{{to_name}}/g, toName)
    .replace(/{{to_email}}/g, recipient)
    .replace(/{{subject}}/g, "Welcome to Piratage: The Ethical Hacking Club")
    .replace(/{{app_url}}/g, "https://piratageauc.vercel.app")
    .replace(/{{logo_url}}/g, "https://piratageauc.vercel.app/piratagelogo.webp");
} catch (err) {
  console.error(`❌ Failed to read template: ${templatePath}`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_SERVER,
  port: Number(SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_LOGIN,
    pass: SMTP_KEY,
  },
});

const mailOptions = {
  from: 'Piratage Club <piratage.auc@gmail.com>',
  to: recipient,
  subject: "Welcome to Piratage: The Ethical Hacking Club",
  html,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("❌ Failed to send email:", error);
    process.exit(1);
  } else {
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  }
});
