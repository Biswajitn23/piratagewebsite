import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { processPendingNotifications } from '../../server/routes/notifications';
import { getFirestore, isFirestoreEnabled } from '../../server/firebase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const path = req.url || '';

  if (path.includes('/send') && req.method === 'POST') {
    try {
      const out = await processPendingNotifications();
      return res.status(200).json(out);
    } catch (err: any) {
      console.error("Send notifications error:", err);
      return res.status(500).json({ error: err?.message || "Internal server error" });
    }
  }

  if (path.includes('/stats') && req.method === 'GET') {
    try {
      if (!isFirestoreEnabled()) {
        return res.status(503).json({ error: "Service unavailable" });
      }
      const db = getFirestore();
      const statsSnapshot = await db.collection("email_notifications").get();
      const stats = statsSnapshot.docs.map(doc => doc.data());
      const summary = {
        pending: stats.filter(s => s.status === "pending").length,
        processing: stats.filter(s => s.status === "processing").length,
        sent: stats.filter(s => s.status === "sent").length,
        failed: stats.filter(s => s.status === "failed").length,
        total: stats.length,
      };
      const subscribersSnapshot = await db.collection("subscribers")
        .where("is_active", "==", true)
        .get();
      return res.status(200).json({
        notifications: summary,
        activeSubscribers: subscribersSnapshot.size,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
