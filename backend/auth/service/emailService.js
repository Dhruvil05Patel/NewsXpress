const { brevo, sender, replyTo } = require("../config/email");
const { generateVerificationLink } = require("./firebaseService");
const { getVerificationEmailHtml } = require("../template/emailTemplate"); // or same file

exports.sendVerificationEmail = async (email, name = "User") => {
  if (!email) throw new Error("Email is required.");

  const link = await generateVerificationLink(email);

  const html = getVerificationEmailHtml({
    name,
    verificationUrl: link,
    supportEmail: "news10express@gmail.com"
  });

  await brevo.sendTransacEmail({
    sender,
    replyTo,
    to: [{ email, name }],
    subject: "Verify your email for NewsXpress",
    htmlContent: html,
  });
};
