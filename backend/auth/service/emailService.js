// backend/auth/service/emailService.js
const { brevo, sender, replyTo } = require("../../config/email/email");
const { renderEmail } = require("../email/emailRenderer");
const { verificationEmailContent } = require("../email/templates/verificationTemplate");
const { resetPasswordContent } = require("../email/templates/resetPasswordTemplate");

exports.sendVerificationEmail = async (email, name, link) => {
  const html = renderEmail(
    verificationEmailContent({
      name,
      verificationUrl: link,
      expirationHours: 24,
    })
  );

  await brevo.sendTransacEmail({
    sender,
    replyTo,
    to: [{ email, name }],
    subject: "Verify your email",
    htmlContent: html,
  });
};

exports.sendResetPasswordEmail = async (email, name, resetUrl) => {
  const html = renderEmail(
    resetPasswordContent({ name, resetUrl })
  );

  await brevo.sendTransacEmail({
    sender,
    replyTo,
    to: [{ email, name }],
    subject: "Reset your password",
    htmlContent: html,
  });
};
