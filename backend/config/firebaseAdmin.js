const admin = require('firebase-admin');

function initFirebaseAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  const keyJson = process.env.FIREBASE_ADMIN_CREDENTIALS || null;

  const fs = require('fs');
  const path = require('path');
  const localKeyPath = path.join(__dirname, '../news-x-press-firebase-adminsdk-fbsvc-565eef2281.json');

  let credential;

  if (fs.existsSync(localKeyPath)) {
    try {
      const serviceAccount = require(localKeyPath);
      credential = admin.credential.cert(serviceAccount);
    } catch (err) {
      console.warn('Failed to load local Firebase JSON file:', err.message);
    }
  }

  if (!credential) {
    if (keyJson) {
      try {
        // Clean up escaped newlines and double quotes if the env variable contains escaped string formatting
        const cleanedKeyJson = keyJson.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        const parsed = JSON.parse(cleanedKeyJson);
        credential = admin.credential.cert(parsed);
      } catch (err) {
        console.error('Failed to parse FIREBASE_ADMIN_SDK JSON:', err.message);
        throw err;
      }
    } else {
      throw new Error('FIREBASE_ADMIN_CREDENTIALS environment variable not set');
    }
  }


  const databaseURL = process.env.FIREBASE_REALTIME_DATABASE_URL;
  
  if (credential) {
    admin.initializeApp({ 
      credential,
      databaseURL: databaseURL 
    });
  } else {
    // initialize without credential so that admin SDK methods will throw explicitly
    admin.initializeApp();
  }

  return admin;
}

module.exports = initFirebaseAdmin();
