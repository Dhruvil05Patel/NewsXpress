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
    // Accept optional fields from the frontend (e.g. signup form): username, full_name
    // Prefer values provided by the frontend over token claims. IMPORTANT: do NOT
    // fall back to the email for `full_name` (avoid storing email as the user's name).
    const requestedUsername = req.body && req.body.username ? req.body.username : null;
    const requestedFullName = req.body && req.body.full_name ? req.body.full_name : null;

    const fallbackUsername = (() => {
      if (requestedUsername) return requestedUsername;
      if (decoded.name) return decoded.name.split(' ').join(''); // keep username compact
      if (decoded.email) return decoded.email.split('@')[0];
      return null;
    })();

    const profileData = {
      // Prefer frontend-provided full_name; otherwise use token name; do NOT use email as full_name
      full_name: requestedFullName || decoded.name || null,
      avatar_url: decoded.picture || null,
      username: fallbackUsername,
      email: decoded.email || null,
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
