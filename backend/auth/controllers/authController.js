const admin = require('../../config/firebaseAdmin');
const { findOrCreateProfileByAuthId } = require('../../services/ProfileService');

/**
 * POST /api/auth/sync
 * Body: { idToken }
 * Verifies Firebase ID token server-side, extracts uid and profile claims,
 * then finds or creates a Profile record in Supabase (via Sequelize).
 */
async function sync(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    // Verify token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error('Firebase token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired ID token' });
    }

    const uid = decoded.uid;
    if (!uid) return res.status(400).json({ message: 'Invalid token: missing uid' });

    // Extract some basic profile info from token claims if present
    // Accept optional username from the frontend (e.g. signup form). If not
    // provided, fall back to token displayName or the local-part of the email.
    const requestedUsername = req.body && req.body.username ? req.body.username : null;

    const fallbackUsername = (() => {
      if (requestedUsername) return requestedUsername;
      if (decoded.name) return decoded.name;
      if (decoded.email) return decoded.email.split('@')[0];
      return null;
    })();

    const profileData = {
      full_name: decoded.name || decoded.email || null,
      avatar_url: decoded.picture || null,
      username: fallbackUsername,
    };

    const profile = await findOrCreateProfileByAuthId(uid, profileData);

    return res.status(200).json({ message: 'Synced', profile });
  } catch (err) {
    console.error('Error in authController.sync:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  sync,
};
