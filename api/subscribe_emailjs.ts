import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore, isFirestoreEnabled } from './firebase.js';
import { Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// Helper to send a welcome/confirmation email via EmailJS.
async function sendWelcomeEmail(email: string, flags: { new?: boolean; reactivated?: boolean; repeat?: boolean }) {
  if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
    console.error('EmailJS credentials not set in environment');
    return;
  }
  
  const emailjs = (await import('@emailjs/nodejs')).default;
  const appUrl = process.env.APP_URL || 'https://piratageauc.vercel.app';
  
  const subjectBase = flags.reactivated
    ? 'Welcome back to Piratage'
    : flags.repeat
    ? 'You are already subscribed'
    : 'Successfully subscribed to Piratage Event Notifications';
    
  const subtitle = flags.reactivated
    ? 'Your subscription has been reactivated. You will now receive email notifications whenever new events are posted.'
    : flags.repeat
    ? 'You are already subscribed and will continue receiving email notifications for new events.'
    : 'You have successfully subscribed to receive email notifications for new events. Whenever we post a new event, you\'ll get an email with all the details!';

  // EmailJS template parameters
  const templateParams = {
    to_email: email,
    to_name: email.split('@')[0],
    subject: subjectBase + ' 🎉',
    subtitle: subtitle,
    app_url: appUrl,
    logo_url: 'https://piratageauc.vercel.app/piratagelogo.webp',
    whatsapp_link: 'https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G',
    linkedin_link: 'https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/',
    instagram_link: 'https://www.instagram.com/piratage_club_auc/',
    discord_link: 'https://discord.gg/9gZKmd8b',
    year: new Date().getFullYear().toString(),
  };

  console.log('Attempting to send email via EmailJS to:', email);
  try {
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    console.log('Email sent result:', result);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!isFirestoreEnabled()) {
      return res.status(503).json({ error: 'Email subscription service unavailable' });
    }
    const db = getFirestore();
    // Check if already subscribed
    const snapshot = await db.collection('subscribers').where('email', '==', email.toLowerCase()).limit(1).get();
    const existing = !snapshot.empty ? snapshot.docs[0].data() : null;
    if (existing) {
      if (existing.is_active) {
        sendWelcomeEmail(email.toLowerCase(), { repeat: true }).catch(() => {});
        return res.status(200).json({ message: 'Already subscribed' });
      } else {
        try {
          await snapshot.docs[0].ref.update({ is_active: true, subscribed_at: Timestamp.now() });
        } catch (error) {
          return res.status(500).json({ error: 'Failed to reactivate subscription' });
        }
        sendWelcomeEmail(email.toLowerCase(), { reactivated: true }).catch(() => {});
        return res.status(200).json({ message: 'Subscription reactivated' });
      }
    }
    // New subscription
    try {
      const subscriberId = randomUUID();
      await db.collection('subscribers').doc(subscriberId).set({
        id: subscriberId,
        email: email.toLowerCase(),
        subscribed_at: Timestamp.now(),
        is_active: true,
        unsubscribe_token: randomUUID(),
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to subscribe' });
    }
    sendWelcomeEmail(email.toLowerCase(), { new: true }).catch(() => {});
    res.status(201).json({ message: 'Successfully subscribed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
