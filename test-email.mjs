import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;

console.log("🔍 Checking EmailJS Configuration:");
console.log("  - SERVICE_ID:", EMAILJS_SERVICE_ID ? "✓" : "✗");
console.log("  - TEMPLATE_ID:", EMAILJS_TEMPLATE_ID ? "✓" : "✗");
console.log("  - PUBLIC_KEY:", EMAILJS_PUBLIC_KEY ? "✓" : "✗");
console.log("  - PRIVATE_KEY:", EMAILJS_PRIVATE_KEY ? "✓" : "✗");

if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
  console.error("❌ Missing EmailJS credentials!");
  process.exit(1);
}

const testEmail = "nbiswajit978@gmail.com";

const templateParams = {
  to_email: testEmail,
  to_name: "Test User",
  subject: "Test Welcome Email 🎉",
  subtitle: "This is a test welcome email to verify EmailJS is working correctly.",
  app_url: "https://piratageauc.vercel.app",
  logo_url: "https://piratageauc.vercel.app/piratagelogo.webp",
  whatsapp_link: "https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G",
  linkedin_link: "https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/",
  instagram_link: "https://www.instagram.com/piratage_club_auc/",
  discord_link: "https://discord.gg/9gZKmd8b",
  year: new Date().getFullYear().toString(),
};

console.log("\n📧 Sending test email to:", testEmail);
console.log("📨 Template params:", JSON.stringify(templateParams, null, 2));

try {
  const result = await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey: EMAILJS_PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    }
  );
  console.log("\n✅ Email sent successfully!");
  console.log("Response:", result);
} catch (error) {
  console.error("\n❌ Failed to send email:");
  console.error("Message:", error?.message);
  console.error("Status:", error?.status);
  console.error("Response:", error?.response);
  process.exit(1);
}
