const Brevo = require("@getbrevo/brevo");

// Load environment variables
const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_KEY;
const senderEmail = process.env.BREVO_USER;   // VERIFIED sender email
const senderName = process.env.BREVO_SENDER_NAME || "NewsXpress";
const replyToEmail = process.env.ADMIN_EMAIL;

// Validate required env values
if (!apiKey) {
  throw new Error("Missing Brevo API key (BREVO_API_KEY or BREVO_KEY).");
}
if (!senderEmail) {
  throw new Error("Missing Brevo sender email (BREVO_SENDER_EMAIL).");
}

// Brevo transactional API client
const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  apiKey
);

module.exports = {
  brevo,
  sender: {
    email: senderEmail,
    name: senderName,
  },
  replyTo: {
    email: replyToEmail,
    name: senderName,
  }
};
