import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const SMS_API_KEY = process.env.SMS_API_KEY;
const sender = "Piratage"; // Sender name registered in Brevo
const recipient = "+918984026227";
const message = "Welcome to Piratage! Your registration is confirmed. Stay Curious. Stay Ethical.";

if (!SMS_API_KEY) {
  console.error("❌ SMS_API_KEY not found in .env.local");
  process.exit(1);
}

const url = "https://api.brevo.com/v3/transactionalSMS/sms";
const payload = {
  sender,
  recipient,
  content: message,
};

fetch(url, {
  method: "POST",
  headers: {
    "api-key": SMS_API_KEY,
    "Content-Type": "application/json",
    "accept": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    if (data.messageId) {
      console.log("✅ SMS sent successfully! Message ID:", data.messageId);
    } else {
      console.error("❌ Failed to send SMS:", data);
    }
  })
  .catch(err => {
    console.error("❌ Error sending SMS:", err);
  });
