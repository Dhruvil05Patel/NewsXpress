const admin = require("firebase-admin");

// Make sure Firebase admin is initialized
// admin.initializeApp({...})

exports.generateVerificationLink = async (email) => {
  return await admin
    .auth()
    .generateEmailVerificationLink(email, {
      url: "http://localhost:5173/all", // Redirect URL after verification
      handleCodeInApp: true,
    });
};


exports.generatePasswordResetLink = async (email) => {
  return await admin
    .auth()
    .generatePasswordResetLink(email, {
      url: "http://localhost:5173/all", // Redirect URL after password reset
      handleCodeInApp: true,
    });
}
