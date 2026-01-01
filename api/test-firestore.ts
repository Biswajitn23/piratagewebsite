import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { isFirestoreEnabled, getFirestore } from '../server/firebase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: "Firestore not configured" });
    }
    const db = getFirestore();
    const testDoc = await db.collection("test").doc("test").get();
    res.json({ status: "ok", exists: testDoc.exists });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
