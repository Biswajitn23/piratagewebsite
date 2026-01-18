dotenv.config({ path: ".env.local" });
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const { BREVO_API_KEY } = process.env;

console.log("🔍 Checking Brevo (Sendinblue) Configuration:");
console.log("  - BREVO_API_KEY:", BREVO_API_KEY ? "✓" : "✗");

if (!BREVO_API_KEY) {
  console.error("❌ Missing Brevo API key!");
  process.exit(1);
}

const testEmail = "nbiswajit978@gmail.com";

const emailData = {
  sender: { name: "Piratage Club", email: "piratage.auc@gmail.com" },
  to: [{ email: testEmail, name: "Test User" }],
  subject: "Test Welcome Email 🎉",
  htmlContent: `
    <h2>Welcome to Piratage!</h2>
    <p>This is a <b>test email</b> to verify Brevo (Sendinblue) is working correctly.</p>
    <p>Visit our <a href="https://piratageauc.tech">website</a>.</p>
    <img src="https://piratageauc.tech/piratagelogo.webp" alt="Logo" width="120" />
    <p>
      <a href="https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G">WhatsApp</a> |
      <a href="https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/">LinkedIn</a> |
      <a href="https://www.instagram.com/piratage_club_auc/">Instagram</a> |
      <a href="https://discord.gg/BYcgdwHPYu">Discord</a>
    </p>
    <p>&copy; ${new Date().getFullYear()} Piratage Club</p>
  `,
};

console.log("\n📧 Sending test email to:", testEmail);
console.log("📨 Email data:", JSON.stringify(emailData, null, 2));

async function sendBrevoEmail() {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });
    const result = await response.json();
    if (response.ok) {
      console.log("\n✅ Email sent successfully!");
      console.log("Response:", result);
    } else {
      console.error("\n❌ Failed to send email:");
      console.error("Status:", response.status);
      console.error("Response:", result);
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error sending email:", error);
    process.exit(1);
  }
}

sendBrevoEmail();
