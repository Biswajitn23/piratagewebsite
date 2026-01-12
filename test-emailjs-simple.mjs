#!/usr/bin/env node

/**
 * Simple EmailJS Test - Verifies welcome email functionality
 * Run: node test-emailjs-simple.mjs
 */

// import emailjs from "@emailjs/nodejs";
import { config } from "dotenv";
import { existsSync } from "fs";

// Load environment variables from .env.local first, then .env
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

console.log("═".repeat(60));
console.log("📧 EmailJS Welcome Email Test");
console.log("═".repeat(60));

// Check if credentials are configured
const credentials = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
};

console.log("\n🔍 Checking Configuration:");
console.log("━".repeat(60));

let hasPlaceholders = false;
Object.entries(credentials).forEach(([key, value]) => {
  if (!value) {
    console.log(`❌ ${key}: NOT SET`);
  } else if (value.includes('your_')) {
    console.log(`⚠️  ${key}: ${value} (PLACEHOLDER - needs real value)`);
    hasPlaceholders = true;
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 15)}...`);
  }
});

if (!credentials.serviceId || !credentials.templateId || !credentials.publicKey || !credentials.privateKey) {
  console.error("\n❌ Missing required EmailJS credentials!");
  console.log("\n📝 Setup Instructions:");
  console.log("1. Go to https://dashboard.emailjs.com/");
  console.log("2. Create a new email service (Gmail, Outlook, etc.)");
  console.log("3. Create a new email template for welcome emails");
  console.log("4. Copy your credentials and update your .env file or Vercel env vars");
  process.exit(1);
}

if (hasPlaceholders) {
  console.error("\n⚠️  Found placeholder values! Replace with real EmailJS credentials.");
  console.log("\n📝 Get your credentials from: https://dashboard.emailjs.com/");
  process.exit(1);
}

// Test email
const testEmail = process.env.TEST_EMAIL || "nbiswajit978@gmail.com";

console.log("\n📨 Preparing Test Email:");
console.log("━".repeat(60));
console.log(`Recipient: ${testEmail}`);

const templateParams = {
  to_email: testEmail,
  to_name: testEmail.split('@')[0],
  subject: "Welcome to Piratage: The Ethical Hacking Club",
  app_url: process.env.APP_URL || "https://piratageauc.vercel.app",
  logo_url: "https://piratageauc.vercel.app/piratagelogo.webp",
  whatsapp_link: "https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G",
  linkedin_link: "https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/",
  instagram_link: "https://www.instagram.com/piratage_club_auc/",
  discord_link: "https://discord.gg/BYcgdwHPYu",
  year: new Date().getFullYear().toString(),
};

console.log("\n🔄 Sending test email via EmailJS...");
console.log("━".repeat(60));

try {
  const result = await emailjs.send(
    credentials.serviceId,
    credentials.templateId,
    templateParams,
    {
      publicKey: credentials.publicKey,
      privateKey: credentials.privateKey,
    }
  );

  console.log("\n✅ SUCCESS! Email sent successfully!");
  console.log("━".repeat(60));
  console.log(`Status: ${result.status}`);
  console.log(`Text: ${result.text}`);
  
  console.log("\n📬 Next Steps:");
  console.log(`1. Check inbox for: ${testEmail}`);
  console.log("2. Check spam/promotions folder");
  console.log("3. Verify email contains all expected content");
  console.log("\n✅ If email is received, your subscribe endpoint will work!");
  console.log("\n🚀 Ready to deploy! Push changes to production.");
  
} catch (error) {
  console.error("\n❌ FAILED to send email!");
  console.error("━".repeat(60));
  console.error("Error:", error.message);
  
  if (error.status) {
    console.error("Status Code:", error.status);
  }
  
  if (error.text) {
    console.error("Response:", error.text);
  }

  console.log("\n🔧 Troubleshooting Guide:");
  console.log("━".repeat(60));
  
  if (error.message.includes("recipients")) {
    console.log("⚠️  ERROR: Recipients address is empty");
    console.log("\n📋 FIX:");
    console.log("1. Go to https://dashboard.emailjs.com/");
    console.log("2. Click Email Templates → " + credentials.templateId);
    console.log("3. In template settings, find 'To Email' field");
    console.log("4. Set it to: {{to_email}}");
    console.log("5. Click Save");
    console.log("6. Run this test again");
  } else {
    console.log("1. Verify Service ID matches your email service in EmailJS dashboard");
    console.log("2. Verify Template ID exists and is published");
    console.log("3. Check template 'To Email' is set to {{to_email}}");
    console.log("4. Ensure all template variables are used with {{variable}} syntax");
    console.log("5. Check your EmailJS account is active");
  }
  
  console.log("\n📚 Resources:");
  console.log("   EmailJS Dashboard: https://dashboard.emailjs.com/");
  console.log("   Integration Guide: https://www.emailjs.com/docs/");
  
  process.exit(1);
}
