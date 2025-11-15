// src/auth/controllers/emailController.js
const { sendVerificationEmail } = require("../service/emailService");

exports.sendVerification = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    await sendVerificationEmail(email, name);

    res.json({ success: true, message: "Verification email sent" });

  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
};
