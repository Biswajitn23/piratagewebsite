import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore, isFirestoreEnabled } from '../firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = 'https://piratageauc.vercel.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No auth code provided' });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'OAuth credentials not configured' });
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return res.status(400).json({ error: err.error_description || 'Token exchange failed' });
    }

    const { access_token, refresh_token, expires_in } = await tokenRes.json();

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      return res.status(400).json({ error: 'Failed to get user info' });
    }

    const { email, name } = await userRes.json();

    // Store in Firestore
    if (isFirestoreEnabled()) {
      const db = getFirestore();
      await db.collection('google_calendar_users').doc(email).set(
        {
          email,
          name,
          refresh_token,
          access_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );
    }

    // Redirect to a success page or back to the app
    res.redirect(302, `/?google_auth=success&email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
