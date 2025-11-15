const admin = require("firebase-admin");

// Make sure Firebase admin is initialized
// admin.initializeApp({...})

exports.generateVerificationLink = async (email) => {
  return await admin
    .auth()
    .generateEmailVerificationLink(email, {
      url: "http://localhost:4000/send-verification-email", // Redirect URL after verification
      handleCodeInApp: true,
    });
};
