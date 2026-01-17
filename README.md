# Email Subscription Backend (Render-ready)

A minimal Node.js Express backend for email subscriptions. Exposes a POST /subscribe endpoint, validates email, and sends a welcome email using Brevo (Sendinblue) API. No database, just email sending. Ready for deployment on Render.

## Features
- POST /subscribe endpoint
- Validates email address
- Sends welcome email via Brevo
- Uses dotenv for configuration

## Setup

1. Clone this repo or upload to Render.
2. Add a `.env` file with these variables:
   - BREVO_API_KEY=your_brevo_api_key
   - BREVO_SENDER_EMAIL=your_verified_sender@yourdomain.com
   - BREVO_WELCOME_TEMPLATE_ID=your_brevo_template_id (optional, default: 1)
   - PORT=10000 (or any port)
3. Run `npm install`
4. Start with `npm start` or `node index.js`

## Deploying to Render
- Create a new Web Service on Render
- Use Node version 18+
- Set environment variables in Render dashboard
- Start command: `npm start`

## Example Request
```
POST /subscribe
Content-Type: application/json
{
  "email": "user@example.com"
}
```

## License
MIT
