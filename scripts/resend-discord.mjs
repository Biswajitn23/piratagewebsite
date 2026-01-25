#!/usr/bin/env node
import 'dotenv/config';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const eventId = process.argv[2];
  if (!eventId) {
    console.error('Usage: node scripts/resend-discord.mjs <eventId>');
    process.exit(2);
  }

  // Initialize Firebase admin using service account file if available
  if (!admin.apps.length) {
    try {
      const saPath = resolve(process.cwd(), 'piratage-d89e7-firebase-adminsdk-fbsvc-9d43b41c81.json');
      const sa = JSON.parse(readFileSync(saPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      console.log('[Firebase] Initialized with service account file');
    } catch (e) {
      console.error('[Firebase] Failed to initialize admin:', e?.message || e);
      process.exit(1);
    }
  }

  const db = admin.firestore();
  const doc = await db.collection('events').doc(eventId).get();
  if (!doc.exists) {
    console.error('Event not found:', eventId);
    process.exit(1);
  }

  const event = { id: doc.id, ...(doc.data() || {}) };

  const webhookUrl = process.env.DISCORD_EVENTS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('DISCORD_EVENTS_WEBHOOK_URL not set in environment');
    process.exit(1);
  }

  try {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const appUrl = process.env.APP_URL || 'https://piratageauc.tech';
    const eventUrl = `${appUrl}/#events`;

    const embed = {
      title: `🎉 New Event: ${event.title}`,
      description: event.description || 'No description provided',
      color: 16711680,
      fields: [
        { name: '📅 Date & Time', value: `${formattedDate} at ${formattedTime}`, inline: false },
        { name: '📍 Location', value: event.location || event.venue || 'TBA', inline: true },
        { name: '📂 Type', value: event.type || 'Event', inline: true },
        { name: '⏳ Status', value: event.status || 'upcoming', inline: true },
      ],
      thumbnail: event.coverImage ? { url: event.coverImage, height: 300, width: 300 } : undefined,
      footer: { text: 'Piratage - The Ethical Hacking Club AUC', icon_url: 'https://piratageauc.tech/piratagelogo.webp' },
      timestamp: new Date().toISOString(),
    };

    if (event.registrationLink) {
      embed.fields.push({ name: '🔗 Registration', value: `[Register Here](${event.registrationLink})`, inline: false });
    }

    const payload = {
      username: 'Piratage Events',
      avatar_url: 'https://piratageauc.tech/piratagelogo.webp',
      embeds: [embed],
      components: [ { type: 1, components: [ { type: 2, label: 'View Events', style: 5, url: eventUrl } ] } ],
    };

    const resp = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Webhook failed: ${resp.status} ${text}`);
    }
    console.log('Discord notification sent for', eventId);
  } catch (err) {
    console.error('Failed to notify Discord:', err?.message || err);
    process.exit(1);
  }
}

main();
