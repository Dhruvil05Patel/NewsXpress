const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function getFirebaseCredentials() {
  // Try checking the local JSON file first
  const localKeyPath = path.join(__dirname, '../news-x-press-firebase-adminsdk-fbsvc-565eef2281.json');
  if (fs.existsSync(localKeyPath)) {
    try {
      return require(localKeyPath);
    } catch (err) {
      console.warn('Failed to load local Firebase JSON file:', err.message);
    }
  }

  const keyJson = process.env.FIREBASE_ADMIN_CREDENTIALS || null;
  // If it's loaded as a complete single line JSON
  if (keyJson && keyJson.trim() !== '{') {
    try {
      return JSON.parse(keyJson);
    } catch (err) {
      // Fall through to manual parsing
    }
  }

  // Manually parse .env for multiline FIREBASE_ADMIN_CREDENTIALS
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split(/\r?\n/);
      let insideJson = false;
      let jsonLines = [];

      for (const line of lines) {
        if (line.trim().startsWith('FIREBASE_ADMIN_CREDENTIALS=')) {
          insideJson = true;
          const startOfJson = line.substring(line.indexOf('=') + 1).trim();
          jsonLines.push(startOfJson);
          if (startOfJson.endsWith('}')) {
            break;
          }
          continue;
        }

        if (insideJson) {
          jsonLines.push(line);
          if (line.trim().endsWith('}') || line.trim().startsWith('}')) {
            break;
          }
        }
      }

      if (jsonLines.length > 0) {
        const fullJsonStr = jsonLines.join('\n');
        return JSON.parse(fullJsonStr);
      }
    }
  } catch (err) {
    console.error('Failed to parse .env file manually:', err.message);
  }

  throw new Error('FIREBASE_ADMIN_CREDENTIALS environment variable not set or invalid');
}

function initFirebaseAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  let credential;
  try {
    const serviceAccount = getFirebaseCredentials();
    credential = admin.credential.cert(serviceAccount);
  } catch (err) {
    console.error('Failed to initialize Firebase Admin credential:', err.message);
    throw err;
  }

  const databaseURL = process.env.FIREBASE_REALTIME_DATABASE_URL;
  
  if (credential) {
    admin.initializeApp({ 
      credential,
      databaseURL: databaseURL 
    });
  } else {
    admin.initializeApp();
  }

  return admin;
}

module.exports = initFirebaseAdmin();
