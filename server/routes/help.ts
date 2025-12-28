import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { isFirestoreEnabled, getFirestore } from "../firebase";
import { Timestamp } from "firebase-admin/firestore";

// Discord webhook function
async function sendDiscordNotification(record: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL not configured");
    return;
  }

  const embed = {
    title: "🆘 New Help Request Received",
    color: 0x00ff88, // Green color
    fields: [
      {
        name: "👤 Name",
        value: record.name,
        inline: true
      },
      {
        name: "📧 Email",
        value: record.email,
        inline: true
      },
      {
        name: "📋 Topic",
        value: record.topic || "General help",
        inline: false
      },
      {
        name: "💬 Message",
        value: record.message.length > 1024 ? record.message.substring(0, 1021) + "..." : record.message,
        inline: false
      },
      {
        name: "🕐 Submitted At",
        value: new Date(record.created_at).toLocaleString(),
        inline: false
      }
    ],
    footer: {
      text: `Request ID: ${record.id}`
    },
    timestamp: record.created_at
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "📢 A new doubt inquiry has been submitted!",
        embeds: [embed]
      })
    });
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}

export const createHelpRequest: RequestHandler = async (req, res) => {
  const { name, email, message, topic } = req.body as {
    name?: string;
    email?: string;
    message?: string;
    topic?: string;
  };

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required" });
  }

  const id = randomUUID();
  const record = {
    id,
    name,
    email,
    message,
    topic: topic ?? "General help",
    created_at: new Date().toISOString(),
  };

  if (isFirestoreEnabled()) {
    try {
      const db = getFirestore();
      await db.collection("help_requests").doc(id).set({
        ...record,
        created_at: Timestamp.now()
      });
      
      // Send Discord notification
      await sendDiscordNotification(record);
      
      return res.status(201).json({ request: record });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  // If Firestore not configured, still send Discord notification
  await sendDiscordNotification(record);
  
  return res.status(201).json({ request: record, warning: "Firestore not configured" });
};

export const listHelpRequests: RequestHandler = async (_req, res) => {
  if (!isFirestoreEnabled()) {
    return res.status(501).json({ error: "Firestore not configured" });
  }
  try {
    const db = getFirestore();
    const snapshot = await db.collection("help_requests")
      .orderBy("created_at", "desc")
      .get();
    
    const requests = snapshot.docs.map(doc => ({
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at
    }));
    
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
