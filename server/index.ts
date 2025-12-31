import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { handleDemo } from "./routes/demo";
import { createEvent, listEvents } from "./routes/events";
import { createHelpRequest, listHelpRequests } from "./routes/help";
import { listGallery } from "./routes/gallery";
import { handleCalendar } from "./routes/calendar";
import { subscribeEmail, unsubscribeEmail } from "./routes/subscribe";
import { sendEventNotifications, getNotificationStats } from "./routes/notifications";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/test-firestore", async (_req, res) => {
    try {
      const { isFirestoreEnabled, getFirestore } = await import("./firebase");
      if (!isFirestoreEnabled()) {
        return res.status(503).json({ error: "Firestore not configured" });
      }
      const db = getFirestore();
      const testDoc = await db.collection("test").doc("test").get();
      res.json({ status: "ok", exists: testDoc.exists });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/events", listEvents);
  app.post("/api/events", createEvent);
  app.get("/api/gallery", listGallery);
  app.post("/api/help", createHelpRequest);
  app.get("/api/help", listHelpRequests);
  app.get("/api/calendar.ics", handleCalendar);
  app.post("/api/subscribe", subscribeEmail);
  app.get("/api/unsubscribe", unsubscribeEmail);
  app.post("/api/notifications/send", sendEventNotifications);
  app.get("/api/notifications/stats", getNotificationStats);

  // Resend webhook for email events with signature verification
  app.post(
    "/api/webhooks/resend",
    express.raw({ type: "application/json" }),
    (req, res) => {
      try {
        const secret = process.env.RESEND_WEBHOOK_SECRET;
        const sigHeader = (req.headers["resend-signature"] || req.headers["x-resend-signature"] || req.headers["signature"] || "") as string;

        if (!secret) {
          console.warn("[Resend Webhook] RESEND_WEBHOOK_SECRET not configured");
          return res.status(500).send("Webhook not configured");
        }

        if (!sigHeader) {
          console.warn("[Resend Webhook] Missing signature header");
          return res.status(400).send("Missing signature header");
        }

        const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
        const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

        // The header may include a prefix like 't=...,v1=signature' or 'v1=...'
        let received = sigHeader;
        if (received.includes("v1=")) {
          const parts = received.split(/v1=|,/);
          const idx = parts.indexOf("");
          // find first non-empty part after split
          received = parts.find(p => p && p.length > 0) || received;
        }
        // normalize
        received = received.trim();

        if (!received || (received !== expected && !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected)))) {
          console.warn("[Resend Webhook] Invalid signature", { expected, received: received.slice(0, 16) + "..." });
          return res.status(401).send("Invalid signature");
        }

        const event = JSON.parse(rawBody.toString("utf8"));
        console.log("[Resend Webhook] Verified event:", event.type, event.data?.email || "no email");

        switch (event.type) {
          case "email.delivered":
            console.log(`✅ Email delivered to ${event.data?.to}`);
            break;
          case "email.bounced":
            console.log(`❌ Email bounced for ${event.data?.to}: ${event.data?.bounce_reason}`);
            break;
          case "email.opened":
            console.log(`👁️ Email opened by ${event.data?.to}`);
            break;
          case "email.clicked":
            console.log(`🔗 Link clicked in email to ${event.data?.to}`);
            break;
          default:
            console.log(`📧 Other email event: ${event.type}`);
        }

        res.status(200).send("OK");
      } catch (error) {
        console.error("[Resend Webhook] Error:", error);
        res.status(500).send("Error");
      }
    }
  );

  return app;
}
