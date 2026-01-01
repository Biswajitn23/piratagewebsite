# EmailJS Template Parameters Reference

## Quick Reference for Your EmailJS Templates

### Welcome/Subscribe Email Template Parameters

Use these variables in your EmailJS template for welcome/subscription emails:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{to_email}}` | Recipient's email address | user@example.com |
| `{{to_name}}` | Recipient's name (extracted from email) | user |
| `{{subject}}` | Email subject line | Successfully subscribed to Piratage Event Notifications 🎉 |
| `{{subtitle}}` | Secondary description text | You have successfully subscribed to receive email notifications |
| `{{app_url}}` | Your application URL | https://piratageauc.vercel.app |
| `{{logo_url}}` | Logo image URL | https://piratageauc.vercel.app/piratagelogo.webp |
| `{{whatsapp_link}}` | WhatsApp group link | https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G |
| `{{linkedin_link}}` | LinkedIn profile link | https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/ |
| `{{instagram_link}}` | Instagram profile link | https://www.instagram.com/piratage_club_auc/ |
| `{{discord_link}}` | Discord server link | https://discord.gg/9gZKmd8b |
| `{{year}}` | Current year | 2026 |

---

### Event Notification Email Template Parameters

Use these variables in your EmailJS template for event notification emails:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{to_email}}` | Recipient's email address | user@example.com |
| `{{to_name}}` | Recipient's name (extracted from email) | user |
| `{{subject}}` | Email subject line | 🚀 New Event: Cybersecurity Workshop |
| `{{event_title}}` | Name of the event | Cybersecurity Workshop |
| `{{event_description}}` | Event description | Join us for an exciting hands-on workshop on ethical hacking |
| `{{event_date}}` | Event date | January 15, 2026 |
| `{{event_time}}` | Event time | 6:00 PM - 8:00 PM |
| `{{event_location}}` | Event venue/location | Computer Lab, Building A |
| `{{app_url}}` | Your application URL | https://piratageauc.vercel.app |
| `{{unsubscribe_url}}` | Link to unsubscribe | https://piratageauc.vercel.app/api/unsubscribe?token=... |
| `{{year}}` | Current year | 2026 |

---

## How to Use in EmailJS Dashboard

1. Go to your EmailJS dashboard
2. Select your template
3. In the template editor, insert variables using double curly braces
4. Example: `Hello {{to_name}}, you have a new event: {{event_title}}`

## Template Creation Tips

### For HTML Templates
```html
<h1>Welcome, {{to_name}}!</h1>
<p>{{subtitle}}</p>
<a href="{{app_url}}">Visit Website</a>
```

### For Plain Text Templates
```
Hi {{to_name}},

{{subtitle}}

Event: {{event_title}}
Date: {{event_date}}
Time: {{event_time}}
Location: {{event_location}}

Visit: {{app_url}}
```

---

## Testing Your Template

Before going live, test your template:

1. In EmailJS dashboard, go to your template
2. Click "Test" button
3. Fill in sample values for each variable
4. Send a test email to yourself
5. Verify all variables are replaced correctly

---

## Common Issues

### Variables Not Showing Up?
- Check spelling and case sensitivity
- Ensure you're using `{{variable}}` not `{variable}` or `$variable`
- Make sure variable names match exactly

### Links Not Working?
- Verify URL variables contain full URLs with `https://`
- Test links in a test email first

### Formatting Issues?
- Use HTML properly in HTML templates
- Use inline CSS for email styling
- Test across different email clients

---

## Need More Variables?

To add more variables to your emails, update the `templateParams` object in:
- `server/routes/subscribe.ts` (line ~110)
- `api/subscribe.ts` (line ~28)
- `server/routes/notifications.ts` (line ~135)

Example:
```typescript
const templateParams = {
  to_email: email,
  to_name: email.split('@')[0],
  // Add your new variable here:
  custom_field: "Your custom value",
  // ...
};
```

Then use `{{custom_field}}` in your EmailJS template!
