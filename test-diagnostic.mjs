#!/usr/bin/env node

/**
 * EmailJS Diagnostic Tool
 * Tests EmailJS configuration and sends a test email
 */

import emailjs from "@emailjs/nodejs";
import fs from "fs";
import path from "path";

// Load environment variables
function loadEnv() {
  const envPath = ".env.local";
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found!");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...valueParts] = trimmed.split("=");
    let value = valueParts.join("=").trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  });

  return env;
}

const env = loadEnv();

console.log("═".repeat(60));
console.log("📧 EmailJS Configuration Diagnostic");
console.log("═".repeat(60));

// Check credentials
console.log("\n🔍 Checking EmailJS Credentials:");
console.log("━".repeat(60));

const requiredKeys = ["EMAILJS_SERVICE_ID", "EMAILJS_TEMPLATE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_PRIVATE_KEY"];
const missing = [];

requiredKeys.forEach((key) => {
  const value = env[key];
  const status = value ? "✓" : "✗";
  const display = value ? value.substring(0, 10) + "..." : "NOT SET";
  console.log(`${status} ${key}: ${display}`);

  if (!value) missing.push(key);
});

if (missing.length > 0) {
  console.error("\n❌ Missing credentials:", missing.join(", "));
  process.exit(1);
}

console.log("\n✅ All credentials found!");

// Test email configuration
console.log("\n📨 Test Email Configuration:");
console.log("━".repeat(60));

const testEmail = "nbiswajit978@gmail.com";
console.log(`Test recipient: ${testEmail}`);

const templateParams = {
  to_email: testEmail,
  to_name: "Test User",
  subject: "Test Welcome Email from Piratage 🎉",
  subtitle: "This is a test welcome email to verify EmailJS is working correctly.",
  app_url: "https://piratageauc.vercel.app",
  logo_url: "https://piratageauc.vercel.app/piratagelogo.webp",
  whatsapp_link: "https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G",
  linkedin_link: "https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/",
  instagram_link: "https://www.instagram.com/piratage_club_auc/",
  discord_link: "https://discord.gg/9gZKmd8b",
  year: new Date().getFullYear().toString(),
};

console.log("\nTemplate Parameters:");
Object.entries(templateParams).forEach(([key, value]) => {
  const display = typeof value === "string" ? (value.length > 50 ? value.substring(0, 47) + "..." : value) : value;
  console.log(`  ${key}: ${display}`);
});

// Attempt to send
console.log("\n🔄 Attempting to send test email...");
console.log("━".repeat(60));

(async () => {
  try {
    const result = await emailjs.send(
      env.EMAILJS_SERVICE_ID,
      env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: env.EMAILJS_PUBLIC_KEY,
        privateKey: env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("\n✅ Email sent successfully!");
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result, null, 2)}`);
    console.log("\n📝 Next Steps:");
    console.log(`1. Check email inbox for: ${testEmail}`);
    console.log("2. Check spam/promotions folder");
    console.log("3. If email is received, your EmailJS setup is working!");
    console.log("4. If not received, verify template variables in EmailJS dashboard");
  } catch (error) {
    console.error("\n❌ Failed to send email!");
    console.error("\n📋 Error Details:");
    console.error(`Message: ${error?.message}`);
    console.error(`Status: ${error?.status}`);

    if (error?.response) {
      console.error(`Response: ${JSON.stringify(error.response, null, 2)}`);
    }

    console.log("\n🔧 Troubleshooting:");
    console.log("1. Verify template ID exists in EmailJS dashboard");
    console.log("2. Check that template contains all required variables:");
    Object.keys(templateParams).forEach((key) => {
      console.log(`   - {{${key}}}`);
    });
    console.log("3. Check your EmailJS account is active and has sending quota");
    console.log("4. Verify service ID matches the email service in your template");

    process.exit(1);
  }
})();
