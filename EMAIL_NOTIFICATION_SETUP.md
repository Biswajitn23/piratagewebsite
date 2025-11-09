# Email Notification System Setup Guide

This guide will help you set up the email notification system for Piratage events using **Resend** (Supabase's recommended email service).

## Overview

The system automatically notifies subscribers when new events are created in Supabase. It consists of:
1. A subscriber database table
2. Email subscription/unsubscribe API endpoints
3. A notification queue system
4. Database triggers that create notification jobs when events are added
5. **Resend integration** for actually sending emails

## Quick Setup (3 Steps)

### Step 1: Run Database Migrations

Execute these SQL files in your Supabase SQL Editor (in order):

1. **`003_create_subscribers_table.sql`** - Creates the subscribers table
2. **`004_create_email_notifications.sql`** - Creates notification queue and triggers

Go to: Supabase Dashboard → SQL Editor → New Query → Paste each migration and run.

### Step 2: Set Up Resend (FREE - 100 emails/day)

1. **Sign up at [resend.com](https://resend.com)** (free tier: 100 emails/day, 3,000/month)
2. **Verify your domain** (or use resend.dev for testing)
   - Go to Domains → Add Domain
   - Add DNS records (they provide instructions)
   - Or use `onboarding@resend.dev` for testing (no verification needed)
3. **Create API Key**
   - Go to API Keys → Create API Key
   - Copy the key (starts with `re_`)
4. **Install Resend**:
   ```bash
   pnpm add resend
   ```
5. **Add to `.env`**:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   FROM_EMAIL=Piratage <notifications@your-domain.com>
   APP_URL=https://your-domain.com
   ```
   
   For testing, use:
   ```env
   FROM_EMAIL=Piratage <onboarding@resend.dev>
   ```

### Step 3: Test the System

1. **Start your server**: `pnpm dev`
2. **Subscribe** via the website (Get Involved section)
3. **Add a test event** in Supabase:
   ```sql
   INSERT INTO events (id, title, date, type, status, description)
   VALUES ('test-123', 'Test Event', now() + interval '7 days', 'Workshop', 'upcoming', 'This is a test event');
   ```
4. **Send notifications**:
   ```bash
   curl -X POST http://localhost:8080/api/notifications/send
   ```
5. **Check your email** - you should receive the notification!

## How It Works

```
User subscribes via website
    ↓
Email stored in subscribers table
    ↓
Admin creates event in Supabase
    ↓
Database trigger creates notification job (pending)
    ↓
Cron job calls /api/notifications/send
    ↓
System fetches all active subscribers
    ↓
Resend sends beautiful HTML email to each subscriber
    ↓
Notification marked as "sent"
```

## Automatic Sending (Production)

For production, set up automatic notification sending every hour:

### Option 1: Vercel Cron (Recommended for Vercel deployment)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/notifications/send",
    "schedule": "0 * * * *"
  }]
}
```

### Option 2: GitHub Actions

Create `.github/workflows/send-notifications.yml`:
```yaml
name: Send Email Notifications
on:
  schedule:
    - cron: '0 * * * *' # Every hour
  workflow_dispatch: # Allow manual trigger
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://your-domain.com/api/notifications/send
```

### Option 3: External Cron Service

Use services like:
- **cron-job.org** (free)
- **EasyCron** 
- **Render Cron Jobs**

Just point them to: `POST https://your-domain.com/api/notifications/send`

## Email Template Features

The notification emails include:
- ✅ Beautiful dark-themed HTML design
- ✅ Event title, date, and description
- ✅ Cover image (if available)
- ✅ Registration link button (if available)
- ✅ Responsive mobile design
- ✅ One-click unsubscribe link
- ✅ Piratage branding

## API Endpoints

- `POST /api/subscribe` - Subscribe an email
- `GET /api/unsubscribe?token=xxx` - Unsubscribe using token
- `POST /api/notifications/send` - Process and send pending notifications
- `GET /api/notifications/stats` - Get notification statistics

## Monitoring

Check notification status:
```bash
curl http://localhost:8080/api/notifications/stats
```

Response:
```json
{
  "notifications": {
    "pending": 5,
    "processing": 0,
    "sent": 20,
    "failed": 1,
    "total": 26
  },
  "activeSubscribers": 150
}
```

## Resend Dashboard

In your Resend dashboard, you can:
- View email delivery status
- See bounce/spam reports
- Check email logs
- Monitor API usage
- Set up webhooks for delivery tracking

## Testing Tips

### Test with Your Own Email

1. Subscribe with your email on the website
2. Add a test event
3. Run: `curl -X POST http://localhost:8080/api/notifications/send`
4. Check your inbox (and spam folder)

### Test Email Template

The email template is in `server/routes/notifications.ts`. Customize:
- Colors and branding
- Logo/header image
- Button styles
- Footer text

### Check Delivery Status

View in Resend dashboard: **Emails** → **Logs**

## Troubleshooting

### Issue: "Email service not configured"
**Solution**: Add `RESEND_API_KEY` to your `.env` file

### Issue: "Resend not installed"
**Solution**: Run `pnpm add resend`

### Issue: Emails not sending
**Checklist**:
- [ ] Resend API key is correct
- [ ] FROM_EMAIL is verified (or using onboarding@resend.dev)
- [ ] Subscribers exist in database (`SELECT * FROM subscribers`)
- [ ] Notifications are pending (`SELECT * FROM email_notifications WHERE status='pending'`)
- [ ] No errors in server logs

### Issue: Emails going to spam
**Solutions**:
- Verify your sending domain in Resend
- Add SPF, DKIM records (Resend provides these)
- Don't send too many emails at once
- Ask subscribers to whitelist your email

### Issue: Domain verification failed
**Solution**: Use `onboarding@resend.dev` for testing (no verification needed)

## Resend Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- 1 verified domain

**Paid Plans:**
- $20/month: 50,000 emails
- $80/month: 250,000 emails

For most clubs, free tier is sufficient!

## Security Notes

- Subscribers table has Row Level Security enabled
- Unsubscribe tokens are automatically generated and unique
- Emails are stored in lowercase to prevent duplicates
- Failed notifications are logged for debugging
- Resend API key should never be exposed to client

## Customization

### Change Email Design

Edit the HTML template in `server/routes/notifications.ts` (line ~115). The current design features:
- Dark theme matching your website
- Purple/teal gradient headers
- Responsive layout
- Mobile-friendly buttons

### Add More Fields

To include more event info in emails:
1. Add fields to `events` table in Supabase
2. Fetch them in the notification handler
3. Add to email template HTML

### Batch Sending

Current setup sends emails in parallel. To send in batches:
- Modify `emailPromises` loop in notifications.ts
- Add delay between batches
- Useful for large subscriber lists

## Production Checklist

- [ ] Run all migrations in production Supabase
- [ ] Sign up for Resend account
- [ ] Verify your sending domain (or use onboarding@resend.dev)
- [ ] Install resend: `pnpm add resend`
- [ ] Set RESEND_API_KEY in production `.env`
- [ ] Set FROM_EMAIL and APP_URL
- [ ] Test subscription flow
- [ ] Test email delivery
- [ ] Set up cron job for automatic sending
- [ ] Monitor Resend dashboard for delivery stats

## Support

**Resend Documentation**: https://resend.com/docs
**Resend Discord**: https://resend.com/discord

---

**Ready to go!** Once you complete Step 1 (migrations), Step 2 (Resend setup), and Step 3 (testing), your email notification system will be fully operational! 🚀
