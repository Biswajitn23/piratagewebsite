import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore, isFirestoreEnabled } from '../firebase.js';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) return null;
    const { access_token } = await res.json();
    return access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, eventId } = req.body;

  if (!email || !eventId) {
    return res.status(400).json({ error: 'email and eventId required' });
  }

  if (!isFirestoreEnabled()) {
    return res.status(503).json({ error: 'Firestore not configured' });
  }

  try {
    const db = getFirestore();

    // Get user's refresh token
    const userDoc = await db.collection('google_calendar_users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not connected to Google Calendar' });
    }

    const userData = userDoc.data();
    let accessToken = userData?.access_token;

    // Refresh token if expired
    const expiresAt = new Date(userData?.expires_at);
    if (expiresAt < new Date()) {
      accessToken = await refreshAccessToken(userData?.refresh_token);
      if (!accessToken) {
        return res.status(401).json({ error: 'Failed to refresh access token' });
      }
      // Update access token in Firestore
      await userDoc.ref.update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      });
    }

    // Get event from Firestore
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventDoc.data();
    const eventDate = new Date(event?.date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    // Create Google Calendar event
    const gcalEvent = {
      summary: event?.title || 'Piratage Event',
      description: event?.description || '',
      location: event?.location || event?.venue || '',
      start: { dateTime: eventDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      conferenceData: event?.joinUrl
        ? {
            conferenceType: 'addOnType',
            addOnType: 'eventType1',
            entryPoints: [{ uri: event.joinUrl, entryPointType: 'more' }],
          }
        : undefined,
    };

    const gcalRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gcalEvent),
    });

    if (!gcalRes.ok) {
      const err = await gcalRes.json();
      console.error('Google Calendar API error:', err);
      return res.status(400).json({ error: err.error?.message || 'Failed to create event' });
    }

    const gcalEventData = await gcalRes.json();
    return res.status(200).json({ event_id: gcalEventData.id });
  } catch (error) {
    console.error('Add event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
