// src/auth/controllers/emailController.js
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../service/emailService");
const {
  generateVerificationLink,
  generatePasswordResetLink,
} = require("../service/firebaseService");

exports.sendVerification = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    let link;
    try {
      link = await generateVerificationLink(email);
    } catch (genErr) {
      if (process.env.NODE_ENV === "production") {
        throw genErr;
      }
      console.warn("⚠️ Firebase generateVerificationLink failed (e.g. rate limit). Generating a mock link for local testing:", genErr.message);
      const baseUrl = process.env.NEWSXPRESS_URL || "http://localhost:5173";
      link = `${baseUrl}/verify?mode=verifyEmail&apiKey=mockKey&oobCode=mockCode`;
    }

    try {
      await sendVerificationEmail(email, name, link);
      res.json({ success: true, message: "✅ Verification email sent" });
    } catch (emailErr) {
      if (process.env.NODE_ENV === "production") {
        throw emailErr;
      }
      console.warn("⚠️ Failed to send verification email via Brevo. Printing link to console for local testing:");
      console.log(`\n🔗 VERIFICATION LINK FOR ${email}:\n${link}\n`);
      res.json({ success: true, message: "✅ Verification email generated (check server console log)" });
    }
  } catch (err) {
    console.error("Email generation error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.sendPasswordReset = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    let resetUrl;
    try {
      resetUrl = await generatePasswordResetLink(email);
    } catch (genErr) {
      if (process.env.NODE_ENV === "production") {
        throw genErr;
      }
      console.warn("⚠️ Firebase generatePasswordResetLink failed. Generating a mock link for local testing:", genErr.message);
      const baseUrl = process.env.NEWSXPRESS_URL || "http://localhost:5173";
      resetUrl = `${baseUrl}/reset-password?mode=resetPassword&apiKey=mockKey&oobCode=mockCode`;
    }

    try {
      await sendResetPasswordEmail(email, name, resetUrl);
      res.json({ success: true, message: "📧 Password reset email sent" });
    } catch (emailErr) {
      if (process.env.NODE_ENV === "production") {
        throw emailErr;
      }
      console.warn("⚠️ Failed to send password reset email via Brevo. Printing link to console for local testing:");
      console.log(`\n🔗 PASSWORD RESET LINK FOR ${email}:\n${resetUrl}\n`);
      res.json({ success: true, message: "📧 Password reset link generated (check server console log)" });
    }
  } catch (err) {
    console.error("Email generation error:", err);
    res.status(500).json({ error: err.message });
  }
};
