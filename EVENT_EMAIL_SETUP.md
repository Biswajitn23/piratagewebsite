# Event Email Template Setup

## Template Overview
The event email template includes:
- Event cover image (with fallback)
- Event details (date, time, location)
- Event description
- **✨ "Save My Spot" button** → redirects to `https://piratageauc.vercel.app/#events`
- 📅 "Add to Calendar" button → downloads ICS file
- Unsubscribe link
- Professional Piratage branding

## Setup Instructions

### Step 1: Go to EmailJS Dashboard
1. Visit https://dashboard.emailjs.com/
2. Go to **Email Templates**
3. Find or create template with ID: `template_0lt92ki`

### Step 2: Update Template Content
Copy the complete HTML from `EVENT_EMAIL_TEMPLATE.html` and paste it into the EmailJS template editor.

### Step 3: Configure Template Variables
Ensure these variables are configured in the template:

**Required Variables:**
- `{{to_email}}` - Recipient email address
- `{{to_name}}` - Recipient name
- `{{event_title}}` - Event name
- `{{event_date}}` - Event date (formatted as: "January 15, 2026")
- `{{event_time}}` - Event time (formatted as: "6:00 PM - 8:00 PM IST")
- `{{event_location}}` - Event location/venue
- `{{event_description}}` - Event description text
- `{{event_cover_url}}` - Event cover image URL (optional)
- `{{ics_download_url}}` - Calendar file download link
- `{{unsubscribe_url}}` - Unsubscribe link with token
- `{{year}}` - Current year

### Step 4: Button Configuration

#### "Save My Spot" Button
```
Button Text: ✨ Save My Spot
URL: https://piratageauc.vercel.app/#events
Color: Purple gradient (#8a2be2 to #4b0082)
```

#### "Add to Calendar" Button
```
Button Text: 📅 Add to Calendar
URL: {{ics_download_url}}
Style: Outlined with cyan border (#00ffff)
```

### Step 5: Test Email
Run the diagnostic test:
```bash
node test-event-alert.mjs
```

Should output:
```
✅ SUCCESS! Event alert email sent!
Status: 200
Response: OK
```

## Variable Formatting Guide

### Date Format
Send as: `"January 15, 2026"`
Format in code:
```javascript
const eventDate = new Date(event.date);
const formattedDate = eventDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

### Time Format
Send as: `"6:00 PM - 8:00 PM IST"`
Format in code:
```javascript
const formattedTime = eventDate.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
});
```

## Email Sending Flow

1. **Event Created** → `POST /api/events`
2. **Trigger Function** → `sendEventInvitesToSubscribers(eventId)`
3. **Get Event Data** → Fetch from Firestore
4. **Get Active Subscribers** → Query all `is_active == true`
5. **Generate ICS File** → Create calendar event
6. **Send Emails** → EmailJS with all template variables
7. **Update Status** → Log success/failures

## Troubleshooting

### Email not sending?
- Check `.env.local` for EmailJS credentials
- Verify `EMAILJS_EVENT_TEMPLATE_ID=template_0lt92ki`
- Run `node test-event-alert.mjs` to diagnose

### Template variables not showing?
- Ensure variable syntax: `{{variable_name}}`
- Check template in EmailJS dashboard for typos
- Verify all variables are passed in code

### Links not working?
- "Save My Spot": Should always link to `https://piratageauc.vercel.app/#events`
- "Add to Calendar": Uses `{{ics_download_url}}` - verify ICS endpoint working
- "Unsubscribe": Uses `{{unsubscribe_url}}` with token - verify token generated

## Template Source Files
- HTML Template: `EVENT_EMAIL_TEMPLATE.html`
- Test Script: `test-event-alert.mjs`
- Implementation: `server/routes/events.ts` (sendEventInvitesToSubscribers function)
