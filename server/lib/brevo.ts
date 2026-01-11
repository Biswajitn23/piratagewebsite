// Brevo (Sendinblue) transactional email integration for Node.js
// This file exports a function to send a welcome email using Brevo API

import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;

export async function sendWelcomeEmailBrevo({
  toEmail,
  toName,
  subject,
  htmlContent,
  senderEmail,
  senderName
}: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  senderEmail: string;
  senderName: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  defaultClient.authentications['api-key'].apiKey = apiKey;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { email: senderEmail, name: senderName };
  sendSmtpEmail.to = [{ email: toEmail, name: toName }];

  // Optionally add more fields (cc, bcc, attachments, etc.)

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo email sent:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ Brevo email error:', error.response?.body || error);
    throw error;
  }
}
