#!/usr/bin/env node

/**
 * EmailJS Event Alert Test
 * Tests sending new event notification emails
 * Run: node test-event-alert.mjs
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

console.log("═".repeat(70));
console.log("📧 EmailJS Event Alert Email Test");
console.log("═".repeat(70));

// Check credentials
const credentials = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  eventTemplateId: process.env.EMAILJS_EVENT_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
};

console.log("\n🔍 Configuration Check:");
console.log("━".repeat(70));

let hasIssues = false;
Object.entries(credentials).forEach(([key, value]) => {
  if (!value) {
    console.log(`❌ ${key}: NOT SET`);
    hasIssues = true;
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  }
});

if (hasIssues) {
  console.error("\n❌ Missing EmailJS credentials!");
  process.exit(1);
}

// Test event data
const testEvent = {
  to_email: process.env.TEST_EMAIL || "nbiswajit978@gmail.com",
  to_name: "Biswajit",
  subject: "New Event Alert: Advanced Web Security Workshop | Piratage Club",
  event_title: "Advanced Web Security Workshop",
  event_date: "January 15, 2026",
  event_time: "6:00 PM - 8:00 PM IST",
  event_location: "AUC, Delhi Campus",
  event_description: "Learn advanced web security techniques including OWASP Top 10, API security, and secure coding practices. This hands-on workshop is perfect for ethical hackers looking to deepen their knowledge.",
  event_cover_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop",
  event_url: "https://piratageauc.vercel.app/events",
  ics_download_url: "https://piratageauc.vercel.app/api/calendar/export-event?id=test-event",
  unsubscribe_url: "https://piratageauc.vercel.app/api/unsubscribe?token=test-token",
};

console.log("\n📨 Test Event Data:");
console.log("━".repeat(70));
console.log(`To: ${testEvent.to_email}`);
console.log(`Event: ${testEvent.event_title}`);
console.log(`Date: ${testEvent.event_date}`);
console.log(`Time: ${testEvent.event_time}`);
console.log(`Location: ${testEvent.event_location}`);

console.log("\n🔄 Sending event alert email...");
console.log("━".repeat(70));

try {
  const result = await emailjs.send(
    credentials.serviceId,
    credentials.eventTemplateId,
    testEvent,
    {
      publicKey: credentials.publicKey,
      privateKey: credentials.privateKey,
    }
  );

  console.log("\n✅ SUCCESS! Event alert email sent!");
  console.log("━".repeat(70));
  console.log(`Status: ${result.status}`);
  console.log(`Response: ${result.text}`);
  
  console.log("\n✅ Email Configuration Complete:");
  console.log("━".repeat(70));
  console.log("✓ Welcome emails working (Welcome template)");
  console.log("✓ Event alert emails working (Event template)");
  console.log("\n📋 Template Variables for Event Alerts:");
  console.log("   {{to_email}} - Recipient email");
  console.log("   {{to_name}} - Recipient name");
  console.log("   {{event_title}} - Event name");
  console.log("   {{event_date}} - Event date");
  console.log("   {{event_time}} - Event time");
  console.log("   {{event_location}} - Event location");
  console.log("   {{event_description}} - Event description");
  console.log("   {{event_cover_url}} - Event banner image URL");
  console.log("   {{event_url}} - Link to event details");
  console.log("   {{ics_download_url}} - Calendar file download link");
  console.log("   {{unsubscribe_url}} - Unsubscribe link");
  
  console.log("\n🚀 Both email systems are now live!");
  
} catch (error) {
  console.error("\n❌ FAILED to send event alert!");
  console.error("━".repeat(70));
  console.error("Error:", error.message);
  
  if (error.status) {
    console.error("Status Code:", error.status);
  }
  
  if (error.text) {
    console.error("Response:", error.text);
  }

  console.log("\n🔧 Troubleshooting:");
  console.log("━".repeat(70));
  
  if (error.message.includes("recipients")) {
    console.log("⚠️  Recipients address is empty");
    console.log("\nFIX: In EmailJS template settings:");
    console.log("1. Set 'To Email' field to: {{to_email}}");
    console.log("2. Click Save");
    console.log("3. Run this test again");
  } else if (!credentials.eventTemplateId) {
    console.log("⚠️  Event template ID not configured");
    console.log("\nFIX:");
    console.log("1. Create event email template in EmailJS dashboard");
    console.log("2. Add to .env.local: EMAILJS_EVENT_TEMPLATE_ID=template_xxxxx");
    console.log("3. Run this test again");
  } else {
    console.log("1. Verify Event Template ID is correct");
    console.log("2. Check template 'To Email' is set to {{to_email}}");
    console.log("3. Verify all variables in template use {{variable}} format");
    console.log("4. Check EmailJS account quota");
  }
  
  console.log("\n📚 Resources:");
  console.log("   EmailJS Dashboard: https://dashboard.emailjs.com/");
  
  process.exit(1);
}
