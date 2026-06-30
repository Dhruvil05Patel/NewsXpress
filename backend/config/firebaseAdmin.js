const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');
const { getDatabase } = require('firebase-admin/database');
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

let defaultApp = null;

const adminWrapper = {
  get apps() {
    return getApps();
  },
  initializeApp(options, name) {
    const app = initializeApp(options, name);
    if (!name || name === '[DEFAULT]') {
      defaultApp = app;
    }
    return app;
  },
  credential: {
    cert(serviceAccount) {
      return cert(serviceAccount);
    }
  },
  auth(app) {
    return getAuth(app || defaultApp || getApp());
  },
  messaging(app) {
    return getMessaging(app || defaultApp || getApp());
  },
  database(app) {
    return getDatabase(app || defaultApp || getApp());
  }
};

function initFirebaseAdmin() {
  if (getApps().length) return adminWrapper;

  let credential;
  const databaseURL = process.env.FIREBASE_REALTIME_DATABASE_URL;

  try {
    const serviceAccount = getFirebaseCredentials();
    if (serviceAccount && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    credential = cert(serviceAccount);
  } catch (err) {
    console.warn('Failed to load Firebase credential from env/file. Attempting fallback:', err.message);
  }

  try {
    if (credential) {
      adminWrapper.initializeApp({ 
        credential,
        databaseURL: databaseURL 
      });
    } else {
      adminWrapper.initializeApp({
        databaseURL: databaseURL
      });
    }
  } catch (err) {
    console.error('Firebase Admin initialization failed:', err.message);
    throw err;
  }

  return adminWrapper;
}

module.exports = initFirebaseAdmin();

