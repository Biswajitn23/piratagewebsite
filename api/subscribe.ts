
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
    const { email, captchaToken } = req.body || {};

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
      return res.status(503).json({ error: 'Email subscription service unavailable' });
    }

    // Store subscriber in Firestore
    let db;
    try {
      db = getFirestore();
      await db.collection('subscribers').doc(email).set({
        email,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      }, { merge: true });
      console.log('Firestore: subscriber saved:', email);
    } catch (dbErr) {
      console.error('Firestore error:', dbErr);
      return res.status(500).json({ error: 'Database error: ' + (dbErr?.message || dbErr) });
    }

    // Send welcome email using Brevo template
    const templateId = process.env.BREVO_WELCOME_TEMPLATE_ID ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID) : 1;
    try {
      await sendWelcomeEmailBrevo({
        toEmail: email,
        toName: email,
        subject: undefined, // subject handled by template
        htmlContent: undefined, // content handled by template
        senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@piratage.com',
        senderName: 'Piratage Team',
        templateId,
        params: {}, // Add template params if needed
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
