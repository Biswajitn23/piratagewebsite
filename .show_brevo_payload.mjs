import 'dotenv/config';
const email = process.argv[2] || 'nbiswajit978@gmail.com';
const name = process.argv[3] || '';
const templateId = process.env.BREVO_WELCOME_TEMPLATE_ID ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID) : 1;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@piratageauc.tech';
const senderName = process.env.BREVO_SENDER_NAME || 'Piratage Team';

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

const paramsProvided = {
  app_url: process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech',
  to_email: email,
  to_name: name || email.split('@')[0],
};

const merged = Object.assign({}, defaults, paramsProvided);
merged.to_name = merged.to_name || (email.split('@')[0]);
merged.to_email = merged.to_email || email;
merged.email = merged.email || email;
merged.subject = merged.subject || `Welcome to Piratage: The Ethical Hacking Club, ${merged.to_name}`;

const payload = {
  sender: { email: senderEmail, name: senderName },
  to: [{ email, name: merged.to_name }],
  templateId,
  params: merged,
};

console.log(JSON.stringify(payload, null, 2));
