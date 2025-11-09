import { RequestHandler } from "express";
import { getSupabase, isSupabaseEnabled } from "../supabase";

export const subscribeEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (!isSupabaseEnabled()) {
      return res.status(503).json({ error: "Email subscription service unavailable" });
    }

    const supabase = getSupabase();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("email, is_active")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_active) {
        return res.status(200).json({ message: "Already subscribed" });
      } else {
        // Reactivate subscription
        const { error } = await supabase
          .from("subscribers")
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq("email", email.toLowerCase());

        if (error) {
          console.error("Error reactivating subscription:", error);
          return res.status(500).json({ error: "Failed to reactivate subscription" });
        }

        return res.status(200).json({ message: "Subscription reactivated" });
      }
    }

    // New subscription
    const { error } = await supabase
      .from("subscribers")
      .insert([{ email: email.toLowerCase() }]);

    if (error) {
      console.error("Error subscribing email:", error);
      return res.status(500).json({ error: "Failed to subscribe" });
    }

    res.status(201).json({ message: "Successfully subscribed" });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unsubscribeEmail: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Unsubscribe token is required" });
    }

    if (!isSupabaseEnabled()) {
      return res.status(503).json({ error: "Email subscription service unavailable" });
    }

    const supabase = getSupabase();

    const { error } = await supabase
      .from("subscribers")
      .update({ is_active: false })
      .eq("unsubscribe_token", token);

    if (error) {
      console.error("Error unsubscribing:", error);
      return res.status(500).json({ error: "Failed to unsubscribe" });
    }

    res.status(200).json({ message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
