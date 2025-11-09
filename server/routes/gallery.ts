import { RequestHandler } from "express";
import { isSupabaseEnabled, getSupabase } from "../supabase";

type GalleryRow = {
  id: string;
  title: string;
  category?: string;
  media: string | null;
  orientation?: string | null;
  description?: string | null;
  created_at?: string;
};

export const listGallery: RequestHandler = async (_req, res) => {
  if (isSupabaseEnabled()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      const rows: GalleryRow[] = (data || []) as GalleryRow[];

      const items = rows.map((r) => {
        const mediaRaw = r.media || "";
        let mediaUrl = String(mediaRaw);
        try {
          if (mediaUrl && !/^https?:\/\//i.test(mediaUrl)) {
            // treat as storage path; guess bucket from first segment
            const parts = mediaUrl.split('/');
            const bucket = parts.length > 1 ? parts[0] : 'event-images';
            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(mediaUrl);
            if (publicData && (publicData as any).publicUrl) mediaUrl = (publicData as any).publicUrl;
          }
        } catch {
          // ignore
        }

        return {
          id: r.id,
          title: r.title,
          category: r.category || "",
          media: mediaUrl,
          orientation: (r.orientation as any) || 'landscape',
          description: r.description || '',
        };
      });

      res.setHeader('X-Gallery-Source', 'supabase');
      return res.json({ items });
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) });
    }
  }

  // No supabase configured -> return empty list
  res.setHeader('X-Gallery-Source', 'file');
  res.json({ items: [] });
};

export default listGallery;
