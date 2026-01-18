import 'dotenv/config';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;

export async function sendWelcomeEmailBrevo({
  toEmail,
  toName,
  subject,
  htmlContent,
  senderEmail,
  senderName,
  templateId,
  params,
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  defaultClient.authentications['api-key'].apiKey = apiKey;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  if (templateId) {
    sendSmtpEmail.templateId = templateId;
    const defaultLogo = process.env.MAIL_LOGO_URL || ((process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech') + '/piratagelogo.webp');
    const defaults = {
      logo_url: defaultLogo,
      app_url: process.env.APP_URL || 'https://piratageauc.tech',
      whatsapp_link: process.env.WHATSAPP_LINK || 'https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G',
      linkedin_link: process.env.LINKEDIN_LINK || 'https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/',
      instagram_link: process.env.INSTAGRAM_LINK || 'https://www.instagram.com/piratage_club_auc/',
      discord_link: process.env.DISCORD_LINK || 'https://discord.gg/BYcgdwHPYu',
      year: new Date().getFullYear().toString(),
    };
    const mergedParams = Object.assign(defaults, params || {});
    // Ensure recipient-specific params are present so template placeholders get replaced
    mergedParams.to_name = mergedParams.to_name || toName || (toEmail ? String(toEmail).split('@')[0] : '');
    mergedParams.to_email = mergedParams.to_email || toEmail || '';
    mergedParams.email = mergedParams.email || toEmail || '';
    // Ensure there's a subject available in template params
    mergedParams.subject = mergedParams.subject || subject || `Welcome to Piratage: The Ethical Hacking Club, ${mergedParams.to_name}`;
    sendSmtpEmail.params = mergedParams;
  } else {
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
  }
  sendSmtpEmail.sender = { email: senderEmail, name: senderName };
  sendSmtpEmail.to = [{ email: toEmail, name: toName }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo email sent:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ Brevo email error:', error?.response?.body || error);
    throw error;
  }
}
