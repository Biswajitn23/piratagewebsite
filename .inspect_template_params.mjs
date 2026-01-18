const email = process.argv[2] || 'nbiswajit978@gmail.com';
const toName = email.split('@')[0];
const providedParams = {
  app_url: (process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech'),
  to_email: email,
  to_name: toName,
};
const defaultLogo = process.env.MAIL_LOGO_URL || ((process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'https://piratageauc.tech') + '/piratagelogo.webp');
const defaults = {
  logo_url: defaultLogo,
  app_url: process.env.APP_URL || 'https://piratageauc.tech',
  whatsapp_link: process.env.WHATSAPP_LINK || 'https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G',
  linkedin_link: process.env.LINKEDIN_LINK || 'https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/',
  instagram_link: process.env.INSTAGRAM_LINK || 'https://www.instagram.com/piratage_club_auc/',
  discord_link: process.env.DISCORD_LINK || 'https://discord.gg/9gZKmd8b',
  year: new Date().getFullYear().toString(),
};
const merged = Object.assign({}, defaults, providedParams);
merged.to_name = merged.to_name || toName;
merged.to_email = merged.to_email || email;
merged.email = merged.email || email;
// ensure subject param
merged.subject = merged.subject || `Welcome to Piratage: The Ethical Hacking Club, ${toName}`;
console.log('FINAL MERGED PARAMS:');
console.log(JSON.stringify(merged, null, 2));
