/**
 * Direct test of Resend email sending
 * Tests if emails can actually be sent with current configuration
 */

import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
config();

async function testEmail() {
  console.log('\n🧪 Testing Resend Email Configuration\n');
  
  // Check environment variables
  console.log('📋 Configuration Check:');
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set (' + process.env.RESEND_API_KEY.substring(0, 10) + '...)' : '❌ Not set'}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || '❌ Not set'}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.log('\n❌ ERROR: RESEND_API_KEY not found in .env file');
    process.exit(1);
  }
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('\n✅ Resend client initialized');
    
    const testEmail = process.argv[2] || 'test@example.com';
    console.log(`\n📧 Sending test email to: ${testEmail}`);
    
    // This HTML matches the template in server/routes/subscribe.ts
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Piratage Subscription Confirmed</title>
</head>

<body style="margin:0; padding:0; background-color:#0b0f14; font-family: 'Courier New', monospace;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1623; border:1px solid #1f2937; border-radius:10px; margin:30px 0;">

          <!-- Header -->
          <tr>
            <td style="padding:30px; text-align:center; color:#22c55e;">
              <img src="/piratagelogo.jpg" alt="Piratage Logo" style="max-width:120px; margin-bottom:15px;" />
              <h1 style="margin:0; font-size:28px; letter-spacing:1px;">
                ✔ ACCESS GRANTED
              </h1>
              <p style="margin-top:10px; color:#9ca3af;">
                Subscription Successful
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 30px 30px; color:#e5e7eb;">
              <p style="font-size:15px; line-height:1.6;">
                You have successfully subscribed to
                <strong style="color:#22c55e;">Piratage Event Notifications</strong>.
              </p>

              <p style="font-size:15px; line-height:1.6;">
                From now on, you'll receive updates about:
              </p>

              <ul style="color:#9ca3af; font-size:14px; line-height:1.8;">
                <li>Cybersecurity Workshops</li>
                <li>Ethical Hacking Events</li>
                <li>Community Announcements</li>
              </ul>

              <p style="font-size:14px; color:#6b7280;">
                Stay curious. Stay ethical.
              </p>
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="https://your-website-link.com"
                 style="background:#22c55e; color:#0b0f14; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:bold; margin-right:10px; display:inline-block;">
                Visit Website
              </a>

              <a href="https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G"
                 style="background:#16a34a; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:bold; display:inline-block;">
                Join WhatsApp Group
              </a>
            </td>
          </tr>

          <!-- Social Media -->
          <tr>
            <td align="center" style="padding:10px 30px 30px; border-top:1px dashed #1f2937;">
              <p style="color:#9ca3af; font-size:13px; margin-bottom:12px;">
                Connect with PIRATAGE
              </p>

              <a href="https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/" style="color:#22c55e; margin:0 10px; text-decoration:none;">LinkedIn</a>
              <a href="https://www.instagram.com/piratage_club_auc/" style="color:#22c55e; margin:0 10px; text-decoration:none;">Instagram</a>
              <a href="https://discord.gg/9gZKmd8b" style="color:#22c55e; margin:0 10px; text-decoration:none;">Discord</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 30px; font-size:12px; color:#6b7280; text-align:center; border-top:1px solid #1f2937;">
              <p style="margin:0 0 8px;">
                If this wasn't you, you can safely ignore this message.
              </p>

              <p style="margin:0;">
                © ${new Date().getFullYear()} Piratage : The Ethical Hacking Club
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
    
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Piratage <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Successfully subscribed to Piratage Event Notifications 🎉',
      html: html,
    });
    
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📬 Result:', JSON.stringify(result, null, 2));
    console.log(`\n🎉 Check ${testEmail} for the confirmation email!`);
    console.log('\nIf using onboarding@resend.dev domain, emails are sent to the Resend account email.\n');
    
  } catch (error) {
    console.log('\n❌ FAILED TO SEND EMAIL');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.log('\n💡 Common issues:');
    console.log('   1. Invalid RESEND_API_KEY');
    console.log('   2. FROM_EMAIL domain not verified in Resend');
    console.log('   3. Using onboarding@resend.dev (check your Resend account email)');
    console.log('   4. Resend API rate limits exceeded\n');
    process.exit(1);
  }
}

testEmail();
