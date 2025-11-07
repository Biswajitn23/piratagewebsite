import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { isSupabaseEnabled, getSupabase } from "../supabase";

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

  if (isSupabaseEnabled()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("help_requests").insert([record]);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ request: record });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  // If Supabase not configured, return created but include record so caller can
  // optionally fallback to other storage.
  return res.status(201).json({ request: record, warning: "Supabase not configured" });
};

export const listHelpRequests: RequestHandler = async (_req, res) => {
  if (!isSupabaseEnabled()) {
    return res.status(501).json({ error: "Supabase not configured" });
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("help_requests").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ requests: data });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
