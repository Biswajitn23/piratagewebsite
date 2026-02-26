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

export const createGalleryItem: RequestHandler = async (req, res) => {
  if (!isFirestoreEnabled()) {
    return res.status(503).json({ error: "Firestore not configured" });
  }

  try {
    const db = getFirestore();
    const newItemsRef = db.collection("gallery").doc();
    const data = {
      ...req.body,
      id: req.body.id || newItemsRef.id,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString() // Save both for compatibility
    };
    await newItemsRef.set(data);
    res.json({ message: "Gallery item added successfully", item: data });
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
};


export const listGallery: RequestHandler = async (_req, res) => {
  if (isFirestoreEnabled()) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection("gallery")
        .get();

      let items = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: data.id || doc.id,
          title: data.title || "",
          category: data.category || "",
          media: data.media || "",
          orientation: data.orientation || "landscape",
          description: data.description || "",
          date_raw: data.created_at || data.createdAt || ""
        };
      });

      // Sort by date descending (most recent first)
      items.sort((a, b) => {
        return b.date_raw.localeCompare(a.date_raw);
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
