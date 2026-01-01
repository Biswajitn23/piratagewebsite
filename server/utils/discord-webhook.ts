import { EventRecordDTO } from "@shared/api";

/**
 * Send event notification to Discord webhook
 */
export async function notifyDiscordNewEvent(event: EventRecordDTO): Promise<void> {
  const webhookUrl = process.env.DISCORD_EVENTS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[Discord Events] DISCORD_EVENTS_WEBHOOK_URL not configured");
    return;
  }

  try {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = eventDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const appUrl = process.env.APP_URL || "https://piratageauc.vercel.app";
    const eventUrl = `${appUrl}/#events`;

    // Create Discord embed message
    const embed = {
      title: `🎉 New Event: ${event.title}`,
      description: event.description || "No description provided",
      color: 16711680, // Red color (0xFF0000)
      fields: [
        {
          name: "📅 Date & Time",
          value: `${formattedDate} at ${formattedTime}`,
          inline: false,
        },
        {
          name: "📍 Location",
          value: event.location || event.venue || "TBA",
          inline: true,
        },
        {
          name: "📂 Type",
          value: event.type || "Event",
          inline: true,
        },
        {
          name: "⏳ Status",
          value: event.status || "upcoming",
          inline: true,
        },
      ],
      thumbnail: event.coverImage
        ? {
            url: event.coverImage,
            height: 300,
            width: 300,
          }
        : undefined,
      footer: {
        text: "Piratage - The Ethical Hacking Club AUC",
        icon_url: "https://piratageauc.vercel.app/piratagelogo.webp",
      },
      timestamp: new Date().toISOString(),
    };

    // Add registration link if available
    if (event.registrationLink) {
      embed.fields.push({
        name: "🔗 Registration",
        value: `[Register Here](${event.registrationLink})`,
        inline: false,
      });
    }

    // Create webhook payload
    const payload = {
      username: "Piratage Events",
      avatar_url: "https://piratageauc.vercel.app/piratagelogo.webp",
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "View Events",
              style: 5,
              url: eventUrl,
            },
          ],
        },
      ],
    };

    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Discord] Webhook error:", error);
      return;
    }

    console.log(`[Discord Events] Event notification sent for "${event.title}"`);
  } catch (error: any) {
    console.error("[Discord Events] Error sending webhook:", error?.message || error);
  }
}
