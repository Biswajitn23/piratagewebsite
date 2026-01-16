import type { VercelRequest, VercelResponse } from '@vercel/node';

import { sendWelcomeEmailBrevo } from '../../server/lib/brevo.js';
import { getFirestore } from '../../server/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, captchaToken } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Optionally: verify captchaToken here

  try {
    // Store subscriber in Firestore
    const db = getFirestore();
    await db.collection('subscribers').doc(email).set({
      email,
      is_active: true,
      subscribed_at: new Date().toISOString(),
    }, { merge: true });

    // Send welcome email using Brevo template
    const templateId = process.env.BREVO_WELCOME_TEMPLATE_ID ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID) : 1;
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
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to subscribe/send email' });
  }
}
