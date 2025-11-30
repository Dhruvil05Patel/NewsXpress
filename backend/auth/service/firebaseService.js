const admin = require("../../config/firebaseAdmin");
const newsxpressUrl = process.env.NEWSXPRESS_URL;
// Make sure Firebase admin is initialized
// admin.initializeApp({...})

exports.generateVerificationLink = async (email) => {
  return await admin
    .auth()
    .generateEmailVerificationLink(email, {
      url: newsxpressUrl, // Redirect URL after verification
      handleCodeInApp: true,
    });
};


exports.generatePasswordResetLink = async (email) => {
  return await admin
    .auth()
    .generatePasswordResetLink(email, {
      url: newsxpressUrl, // Redirect URL after password reset
      handleCodeInApp: true,
    });
}
