// Brevo (Sendinblue) transactional email integration for Node.js
// This file exports a function to send a welcome email using Brevo API

import "dotenv/config";
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
  params
}: {
  toEmail: string;
  toName: string;
  subject?: string;
  htmlContent?: string;
  senderEmail: string;
  senderName: string;
  templateId?: number;
  params?: Record<string, any>;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  defaultClient.authentications['api-key'].apiKey = apiKey;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  if (templateId) {
    sendSmtpEmail.templateId = templateId;
    // Merge provided params with defaults (e.g., logoUrl)
    const defaultLogo = process.env.MAIL_LOGO_URL || ((process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : '') + '/piratagelogo.webp');
    const mergedParams = Object.assign({ logoUrl: defaultLogo }, params || {});
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
    console.error('❌ Brevo email error:', error.response?.body || error);
    throw error;
  }
}
