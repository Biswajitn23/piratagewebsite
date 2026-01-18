require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.post('/subscribe', async (req, res) => {
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
    const resp = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: senderEmail, name: 'Piratage Team' },
        to: [{ email }],
        templateId,
        params: {},
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.json({ success: true, brevo: resp.data });
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
