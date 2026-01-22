require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const fs = require('fs');
const path = require('path');
const DATA_DIR = process.env.DATA_DIR || '.data';

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Backend] Cannot create data directory, continuing without local file fallback');
  }
}

async function writeLocalSubscriber(email, name) {
  try {
    ensureDataDir();
    const file = path.join(DATA_DIR, 'subscribers.json');
    let list = [];
    if (fs.existsSync(file)) {
      try {
        list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
      } catch (e) {
        list = [];
      }
    }
    // Upsert by email
    const lower = String(email).toLowerCase();
    const idx = list.findIndex(s => s.email === lower);
    const now = new Date().toISOString();
    const entry = { email: lower, name: name || '', is_active: true, subscribed_at: now };
    if (idx >= 0) {
      list[idx] = Object.assign(list[idx], entry);
    } else {
      list.push(entry);
    }
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
    fs.renameSync(tmp, file);
    console.log('Local file: subscriber saved:', email);
    return true;
  } catch (err) {
    console.error('Local file save error:', err?.message || err);
    return false;
  }
}

// Firestore (optional) - initialize if FIREBASE_* envs are present
const admin = require('firebase-admin');
function initFirestoreIfNeeded() {
  if (admin.apps && admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    // Not configured — skip initialization
    console.warn('Firestore not configured in backend (missing FIREBASE envs)');
    return;
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  console.log('✅ Firebase admin initialized in backend');
}

// Simple GET for quick browser checks (POST is still used for subscribing)
app.post('/api/subscribe', async (req, res) => {
  const { email, name } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Try to save subscriber to Firestore (best-effort). If it fails, continue to send email.
  let dbSaveSuccess = false;
  try {
    initFirestoreIfNeeded();
    if (admin.apps && admin.apps.length) {
      const db = admin.firestore();
      const docId = email.toLowerCase();
      const unsubscribeToken = require('crypto').randomUUID ? require('crypto').randomUUID() : (String(Date.now()) + Math.random().toString(36).slice(2,8));
      await db.collection('subscribers').doc(docId).set({
        email: email.toLowerCase(),
        name: name || '',
        is_active: true,
        subscribed_at: admin.firestore.FieldValue.serverTimestamp(),
        unsubscribe_token: unsubscribeToken
      }, { merge: true });
      console.log('Firestore: subscriber saved:', email);
      dbSaveSuccess = true;
    } else {
      console.warn('Firestore not initialized; using local-file fallback for', email);
      await writeLocalSubscriber(email, name);
      dbSaveSuccess = true;
    }
  } catch (dbErr) {
    console.error('Firestore save error (continuing):', dbErr?.message || dbErr);
  }

  // Respond immediately after DB save
  if (dbSaveSuccess) {
    res.json({ success: true, message: "Subscribed and saved to database." });
  } else {
    res.status(500).json({ error: "Failed to save subscriber to database." });
    return;
  }

  // Send email via Brevo in background
  (async () => {
    try {
      const apiKey = process.env.BREVO_API_KEY;
      const senderEmail = process.env.BREVO_SENDER_EMAIL;
      const templateId = process.env.BREVO_WELCOME_TEMPLATE_ID ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID) : 1;
      if (!apiKey || !senderEmail) {
        console.error('Missing Brevo config');
        return;
      }
      const templatePayload = {
        sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || 'Piratage Team' },
        to: [{ email }],
        templateId,
        params: {
          app_url: process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech',
          to_email: email,
          to_name: name || (email ? email.split('@')[0] : ''),
          logo_url: process.env.MAIL_LOGO_URL || ((process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : '') + '/piratagelogo.webp'),
          subject: `Welcome to Piratage: The Ethical Hacking Club, ${name || (email ? email.split('@')[0] : '')}`,
          whatsapp_link: process.env.WHATSAPP_LINK || 'https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G',
          linkedin_link: process.env.LINKEDIN_LINK || 'https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/',
          instagram_link: process.env.INSTAGRAM_LINK || 'https://www.instagram.com/piratage_club_auc/',
          discord_link: process.env.DISCORD_LINK || 'https://discord.gg/BYcgdwHPYu',
          year: new Date().getFullYear().toString(),
        },
      };
      try {
        await axios.post('https://api.brevo.com/v3/smtp/email', templatePayload, {
          headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        });
      } catch (templateErr) {
        const errData = templateErr?.response?.data;
        console.error('Brevo template send error:', errData || templateErr.message);
        if (errData && errData.code && errData.code.toString().includes('missing_parameter')) {
          const fallback = {
            sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || 'Piratage Team' },
            to: [{ email }],
            subject: "Welcome to Piratage",
            htmlContent: `<p>Thanks for subscribing to Piratage updates — we'll keep you posted.</p>`,
          };
          try {
            await axios.post('https://api.brevo.com/v3/smtp/email', fallback, {
              headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
            });
          } catch (fallbackErr) {
            console.error('Brevo fallback error:', fallbackErr?.response?.data || fallbackErr.message);
          }
        }
      }
    } catch (err) {
      console.error('Brevo error:', err?.response?.data || err.message);
    }
  })();
});

app.get('/', (req, res) => {
  res.send('Email subscription backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
