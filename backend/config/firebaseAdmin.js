const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using either a JSON string (FIREBASE_ADMIN_SDK)
// or a file path (FIREBASE_ADMIN_KEY_PATH). This keeps secrets out of the repo.
function initFirebaseAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  const keyJson = process.env.FIREBASE_ADMIN_CREDENTIALS || null;

  let credential;
  if (keyJson) {
    try {
      const parsed = JSON.parse(keyJson);
      credential = admin.credential.cert(parsed);
    } catch (err) {
      console.error('Failed to parse FIREBASE_ADMIN_SDK JSON:', err.message);
      throw err;
    }
  }else{
    throw new Error('FIREBASE_ADMIN_CREDENTIALS environment variable not set');
  }


  if (credential) {
    admin.initializeApp({ credential });
  } else {
    // initialize without credential so that admin SDK methods will throw explicitly
    admin.initializeApp();
  }

  return admin;
}

module.exports = initFirebaseAdmin();
