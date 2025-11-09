import "dotenv/config";
import express from "express";
import cors from "cors";
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

  return app;
}
