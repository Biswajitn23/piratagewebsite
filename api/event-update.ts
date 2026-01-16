import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendWelcomeEmailBrevo } from '../../server/lib/brevo.js';
import { getFirestore } from '../../server/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, eventName, eventDate } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!eventName || typeof eventName !== 'string') {
    return res.status(400).json({ error: 'Event name required' });
  }

  try {
    // Store event notification in Firestore
    const db = getFirestore();
    await db.collection('event_notifications').add({
      email,
      eventName,
      eventDate: eventDate || null,
      notified_at: new Date().toISOString(),
    });

    // Send event notification email using Brevo template (ID 2)
    await sendWelcomeEmailBrevo({
      toEmail: email,
      toName: email,
      subject: undefined,
      htmlContent: undefined,
      senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@piratage.com',
      senderName: 'Piratage Team',
      templateId: 2,
      params: {
        EVENT_NAME: eventName,
        EVENT_DATE: eventDate || '',
      },
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to send event email' });
  }
}
