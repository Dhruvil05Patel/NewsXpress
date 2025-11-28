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

    const link = await generateVerificationLink(email);

    await sendVerificationEmail(email, name, link);

    res.json({ success: true, message: "✅ Verification email sent" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.sendPasswordReset = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const resetUrl = await generatePasswordResetLink(email);

    await sendResetPasswordEmail(email, name, resetUrl);

    res.json({ success: true, message: "📧 Password reset email sent" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
};
