
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendWelcomeEmailBrevo } from '../server/lib/brevo';
import { getFirestore, isFirestoreEnabled } from '../server/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Subscribe API hit');
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Log the incoming request body
    console.log('Request body:', req.body);
    const { email, captchaToken, name } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Optionally: verify captchaToken here

    // DEBUG: Dump all env variables (remove after debugging)
    console.log('ENV DUMP:', JSON.stringify({
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '[HIDDEN]' : undefined,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      BREVO_API_KEY: process.env.BREVO_API_KEY ? '[HIDDEN]' : undefined,
      NODE_ENV: process.env.NODE_ENV,
    }, null, 2));

    // Fail fast if any Firebase env is missing
    if (!process.env.FIREBASE_PROJECT_ID) {
      return res.status(503).json({ error: 'Missing FIREBASE_PROJECT_ID in environment' });
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      return res.status(503).json({ error: 'Missing FIREBASE_CLIENT_EMAIL in environment' });
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      return res.status(503).json({ error: 'Missing FIREBASE_PRIVATE_KEY in environment' });
    }

    // Debug: Log Firebase env variables
    console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

    // Debug: Log isFirestoreEnabled
    console.log('isFirestoreEnabled:', isFirestoreEnabled());

    if (!isFirestoreEnabled()) {
      return res.status(503).send('Subscription service unavailable - Firestore not configured');
    }

    // Store subscriber in Firestore (use lowercase doc id and add unsubscribe token)
    let db;
    try {
      db = getFirestore();
      const lower = String(email).toLowerCase();
      const unsubscribeToken = cryptoRandomToken();
      await db.collection('subscribers').doc(lower).set({
        email: lower,
        name: name || '',
        is_active: true,
        subscribed_at: new Date().toISOString(),
        unsubscribe_token: unsubscribeToken,
      }, { merge: true });
      console.log('Firestore: subscriber saved:', lower);
    } catch (dbErr) {
      console.error('Firestore error:', dbErr);
      return res.status(500).json({ error: 'Database error: ' + (dbErr?.message || dbErr) });
    }

    // Send welcome email using Brevo template
    const templateId = process.env.BREVO_WELCOME_TEMPLATE_ID ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID) : 1;
    try {
      const appUrl = process.env.APP_URL || 'https://piratageauc.tech';
      await sendWelcomeEmailBrevo({
        toEmail: email,
        toName: name || email.split('@')[0],
        subject: undefined, // subject handled by template
        htmlContent: undefined, // content handled by template
        senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@piratageauc.tech',
        senderName: process.env.BREVO_SENDER_NAME || 'Piratage Team',
        templateId,
        params: {
          app_url: appUrl,
          to_email: email,
          to_name: name || email.split('@')[0],
          name: name || '',
        },
      });
      console.log('Brevo: welcome email sent to', email);
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
      return res.status(500).json({ error: 'Email failed: ' + (emailErr?.message || emailErr) });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Subscribe API error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to subscribe/send email' });
  }
}

// Small helper to generate a compact unsubscribe token
function cryptoRandomToken() {
  try {
    return require('crypto').randomUUID();
  } catch (e) {
    return String(Date.now()) + Math.random().toString(36).slice(2, 8);
  }
}
