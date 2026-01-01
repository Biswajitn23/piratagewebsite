# EmailJS Integration Guide

## ✅ Migration Complete!

Your Piratage application has been migrated from Resend to EmailJS for email functionality.

## 📋 What Was Changed

### 1. **Dependencies**
- ✅ Added: `@emailjs/nodejs` package
- ⚠️ Kept but deprecated: `resend` package (can be removed if desired)

### 2. **Environment Variables**
Updated both `.env` and `.env.local` files with EmailJS credentials:
```bash
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

### 3. **Updated Files**
- ✅ `server/routes/subscribe.ts` - Email sending logic updated to use EmailJS
- ✅ `api/subscribe.ts` - Email sending logic updated to use EmailJS
- ✅ `server/routes/notifications.ts` - Event notification emails updated
- ✅ `server/index.ts` - Resend webhook endpoint commented out

### 4. **Backup Files Created**
- `server/routes/subscribe_resend_backup.ts` - Original subscribe route
- `api/subscribe_resend_backup.ts` - Original API subscribe route

## 🚀 Setup Instructions

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account

### Step 2: Add Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note your **Service ID**

### Step 3: Create Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use the following template variables in your email template:

#### For Welcome/Subscribe Emails:
```
{{to_email}} - Recipient email
{{to_name}} - Recipient name
{{subject}} - Email subject
{{subtitle}} - Email subtitle/description
{{app_url}} - Your app URL
{{logo_url}} - Logo image URL
{{whatsapp_link}} - WhatsApp group link
{{linkedin_link}} - LinkedIn profile link
{{instagram_link}} - Instagram profile link
{{discord_link}} - Discord server link
{{year}} - Current year
```

#### For Event Notification Emails:
```
{{to_email}} - Recipient email
{{to_name}} - Recipient name
{{subject}} - Email subject
{{event_title}} - Event title
{{event_description}} - Event description
{{event_date}} - Event date
{{event_time}} - Event time
{{event_location}} - Event location
{{app_url}} - Your app URL
{{unsubscribe_url}} - Unsubscribe link
{{year}} - Current year
```

4. Design your template using the EmailJS template editor
5. Save and note your **Template ID**

### Step 4: Get API Keys
1. Go to **Account** → **General** in the dashboard
2. Find your **Public Key** (also called User ID)
3. Create a **Private Key**:
   - Go to **Account** → **API Keys**
   - Click **Create New Key**
   - Note your **Private Key** (shown only once!)

### Step 5: Update Environment Variables
Update both `.env` and `.env.local` files:

```bash
# Replace these placeholders with your actual EmailJS credentials
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key_here
EMAILJS_PRIVATE_KEY=your_private_key_here

# Update your email address
FROM_EMAIL=Piratage <your-email@domain.com>
```

### Step 6: Test the Integration
1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Test subscription:
   - Go to your website
   - Subscribe with an email address
   - Check the console for log messages
   - Check your email inbox

## 📧 Email Template Example

Here's a basic EmailJS template structure for the welcome email:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background-color:#0b0f14; font-family: 'Courier New', monospace;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1623; border:1px solid #1f2937; border-radius:10px; margin:30px 0;">
                    <tr>
                        <td style="padding:30px; text-align:center; color:#22c55e;">
                            <img src="{{logo_url}}" alt="Piratage Logo" style="max-width:120px; margin-bottom:15px;" />
                            <h1 style="margin:0; font-size:28px;">✔ ACCESS GRANTED</h1>
                            <p style="margin-top:10px; color:#9ca3af;">{{subtitle}}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 30px 30px; color:#e5e7eb;">
                            <p>You have successfully subscribed to <strong style="color:#22c55e;">Piratage Event Notifications</strong>.</p>
                            <ul style="color:#9ca3af;">
                                <li>Cybersecurity Workshops</li>
                                <li>Ethical Hacking Events</li>
                                <li>Community Announcements</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:30px;">
                            <a href="{{app_url}}" style="background:#22c55e; color:#0b0f14; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:bold;">Visit Website</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 30px; font-size:12px; color:#6b7280; text-align:center; border-top:1px solid #1f2937;">
                            <p>© {{year}} Piratage : The Ethical Hacking Club</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## 🔍 Troubleshooting

### Emails not sending?
1. Check console logs for error messages
2. Verify all EmailJS credentials are correct in `.env` files
3. Ensure your EmailJS template ID matches the one in the code
4. Check EmailJS dashboard for usage limits (free tier: 200 emails/month)
5. Verify email service is properly configured in EmailJS dashboard

### Template variables not working?
1. Make sure variable names in your EmailJS template match exactly (case-sensitive)
2. Use double curly braces: `{{variable_name}}`
3. Test template in EmailJS dashboard before using in code

### Getting rate limit errors?
EmailJS free tier limits:
- 200 emails per month
- Consider upgrading to a paid plan for production use

## 📚 Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Node.js SDK](https://www.emailjs.com/docs/sdk/installation/)
- [EmailJS Templates Guide](https://www.emailjs.com/docs/user-guide/creating-email-template/)

## 🗑️ Optional: Remove Resend

To completely remove Resend from your project:

```bash
pnpm remove resend
```

Then remove these backup files:
- `server/routes/subscribe_resend_backup.ts`
- `api/subscribe_resend_backup.ts`

## ✨ Next Steps

1. ✅ Set up EmailJS account and templates
2. ✅ Update environment variables with real credentials
3. ✅ Test email sending functionality
4. ✅ Deploy to production with updated credentials
5. ✅ Monitor EmailJS usage in dashboard

---

**Need Help?** Check the EmailJS dashboard or documentation for more assistance!
