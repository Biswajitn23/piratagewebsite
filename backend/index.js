require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Simple GET for quick browser checks (POST is still used for subscribing)
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Send email via Brevo
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const templateId = process.env.BREVO_WELCOME_TEMPLATE_ID ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID) : 1;
    if (!apiKey || !senderEmail) {
      return res.status(500).json({ error: 'Missing Brevo config' });
    }
    // Try sending using template (if configured). If Brevo rejects due to missing template params,
    // fall back to a simple subject/htmlContent email so subscriptions still work.
    const templatePayload = {
      sender: { email: senderEmail, name: 'Piratage Team' },
      to: [{ email }],
      templateId,
    };

    try {
      const resp = await axios.post('https://api.brevo.com/v3/smtp/email', templatePayload, {
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      });
      return res.json({ success: true, brevo: resp.data });
    } catch (templateErr) {
      const errData = templateErr?.response?.data;
      console.error('Brevo template send error:', errData || templateErr.message);
      // If error indicates missing params for template, retry with a basic email payload
      if (errData && errData.code && errData.code.toString().includes('missing_parameter')) {
        const fallback = {
          sender: { email: senderEmail, name: 'Piratage Team' },
          to: [{ email }],
          subject: "Welcome to Piratage",
          htmlContent: `<p>Thanks for subscribing to Piratage updates — we'll keep you posted.</p>`,
        };
        try {
          const resp2 = await axios.post('https://api.brevo.com/v3/smtp/email', fallback, {
            headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
          });
          return res.json({ success: true, brevo: resp2.data, fallback: true });
        } catch (fallbackErr) {
          console.error('Brevo fallback error:', fallbackErr?.response?.data || fallbackErr.message);
          return res.status(500).json({ error: fallbackErr?.response?.data || fallbackErr.message });
        }
      }
      // Other template errors: return as-is
      return res.status(500).json({ error: errData || templateErr.message });
    }
  } catch (err) {
    console.error('Brevo error:', err?.response?.data || err.message);
    return res.status(500).json({ error: err?.response?.data || err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Email subscription backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
