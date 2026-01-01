import { RequestHandler } from "express";
import { isFirestoreEnabled, getFirestore } from "../firebase.js";

type GalleryRow = {
  id: string;
  title: string;
  category?: string;
  media: string | null;
  orientation?: string | null;
  description?: string | null;
  created_at?: any;
};

export const listGallery: RequestHandler = async (_req, res) => {
  if (isFirestoreEnabled()) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection("gallery")
        .orderBy("created_at", "asc")
        .get();
      
      const items = snapshot.docs.map(doc => {
        const data = doc.data() as GalleryRow;
        return {
          id: data.id || doc.id,
          title: data.title || "",
          category: data.category || "",
          media: data.media || "",
          orientation: data.orientation || "landscape",
          description: data.description || "",
        };
      });

      res.setHeader('X-Gallery-Source', 'firestore');
      return res.json({ items });
    } catch (err: any) {
      return res.status(500).json({ error: String(err?.message || err) });
    }
  }

  // No Firestore configured -> return empty list
  res.setHeader('X-Gallery-Source', 'none');
  res.json({ items: [] });
};

export default listGallery;
