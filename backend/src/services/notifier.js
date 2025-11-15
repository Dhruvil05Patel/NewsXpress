const admin = require("firebase-admin");

let initialized = false;

/**
 * Initialize Firebase Admin using service account JSON from env
 * FIREBASE_SA_JSON must be the minified JSON string (single-line)
 */
function initNotifier() {
  if (initialized) return;
  const saJson = process.env.FIREBASE_SA_JSON;
  if (!saJson) {
    console.warn("FIREBASE_SA_JSON not found in env — notifier will be disabled.");
    return;
  }
  try {
    const credentials = JSON.parse(saJson);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    initialized = true;
    console.log("Firebase Admin initialized for notifier.");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SA_JSON:", err.message);
  }
}

async function fetchSubscriberTokens(category) {
  // Attempt to read tokens from your database (Sequelize models loaded in config/db)
  // This implementation tries multiple common patterns and returns an array
  // of FCM token strings. If your schema differs, adapt the field names below.
  try {
    const db = require('../../config/db');
    const { Op } = db.Sequelize;

    if (!db.Profile) {
      console.warn('fetchSubscriberTokens: Profile model not available in db.');
      return [];
    }

    const attrs = db.Profile.rawAttributes || {};

    // Candidate token fields on Profile (pick first that exists)
    const tokenFieldCandidates = ['fcm_token', 'fcm_tokens', 'device_token', 'device_tokens'];
    let tokenField = tokenFieldCandidates.find((f) => !!attrs[f]);

    // If there is a separate DeviceToken model, prefer that
    if (!tokenField && (db.DeviceToken || db.DeviceTokens)) {
      const DeviceModel = db.DeviceToken || db.DeviceTokens;
      // Look for tokens for profiles subscribed to category (if DeviceModel has category/profile relation)
      try {
        // Try simple query: DeviceModel has `token` and `category` columns
        const rows = await DeviceModel.findAll({ where: { category }, attributes: ['token'] });
        return rows.map(r => r.token).filter(Boolean);
      } catch (err) {
        console.warn('fetchSubscriberTokens: DeviceModel query failed, falling back to Profile checks.', err.message);
      }
    }

    if (!tokenField) {
      console.warn('fetchSubscriberTokens: No token field found on Profile (expected one of: ' + tokenFieldCandidates.join(', ') + ').');
      console.warn('Please add a `fcm_token` (TEXT) column to `profiles` or create a DeviceTokens table. Returning empty list to avoid accidental pushes.');
      return [];
    }

    // Determine how subscriptions are stored on Profile
    // Common patterns: a single `topic` text column, or an array column like `actor`, `topics`, `categories`.
    const arrayFields = ['actor', 'topics', 'categories', 'subscriptions', 'device_topics'];
    const foundArrayField = arrayFields.find((f) => !!attrs[f]);
    const where = {};

    if (foundArrayField) {
      // Postgres array contains
      where[foundArrayField] = { [Op.contains]: [category] };
    } else if (attrs.topic) {
      where.topic = category;
    } else if (attrs.topic_pref || attrs.topic_preference) {
      where.topic_pref = category;
    } else {
      // No obvious subscription column found — return empty but log helpful info
      console.warn('fetchSubscriberTokens: No subscription column found (e.g. topics/actor/topic).');
      return [];
    }

    // Query matching profiles and pluck token values
    const rows = await db.Profile.findAll({ where, attributes: [tokenField] });
    const tokens = [];
    for (const r of rows) {
      const val = r.get(tokenField);
      if (!val) continue;
      if (Array.isArray(val)) {
        tokens.push(...val.filter(Boolean));
      } else if (typeof val === 'string') {
        tokens.push(val);
      }
    }

    // Deduplicate
    return Array.from(new Set(tokens));
  } catch (err) {
    console.error('fetchSubscriberTokens error:', err.message);
    return [];
  }
}

/**
 * Send notification payload to a list of tokens (handles batching)
 */
async function sendNotificationToTokens(tokens = [], payload = {}) {
  if (!initialized) {
    console.warn("Notifier not initialized. Call initNotifier() at server startup.");
    return { success: false, reason: "not-initialized" };
  }
  if (!tokens || tokens.length === 0) {
    return { success: true, sent: 0 };
  }

  // FCM supports up to 500 tokens per multicast call
  const CHUNK = 400;
  let totalSent = 0;
  for (let i = 0; i < tokens.length; i += CHUNK) {
    const chunk = tokens.slice(i, i + CHUNK);
    try {
      const resp = await admin.messaging().sendMulticast({
        tokens: chunk,
        notification: {
          title: payload.title || "NewsXpress: new article",
          body: payload.body || "Tap to read",
        },
        data: payload.data || {},
      });
      totalSent += chunk.length;
      console.log(`FCM: sendMulticast success: ${resp.successCount}/${chunk.length}`);
    } catch (err) {
      console.error("FCM send error:", err.message);
    }
  }

  return { success: true, sent: totalSent };
}

/**
 * Public helper: find tokens for a category and notify them about `article`
 * - `article` should contain { title, summary, newsUrl, category, imageUrl }
 */
async function notifySubscribersForCategory(category, article = {}) {
  try {
    const tokens = await fetchSubscriberTokens(category);
    if (!tokens || tokens.length === 0) {
      console.log(`No subscribed tokens for category=${category}`);
      return { success: true, sent: 0 };
    }

    const payload = {
      title: `New ${category} update: ${article.title?.slice(0, 60)}`,
      body: article.summary?.slice(0, 120) || "New article published",
      data: {
        url: article.newsUrl || article.original_url || "",
        id: article.id || "",
        category: category,
      },
    };

    const result = await sendNotificationToTokens(tokens, payload);
    return result;
  } catch (err) {
    console.error("notifySubscribersForCategory error:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  initNotifier,
  notifySubscribersForCategory,
  // export fetchSubscriberTokens for you to implement if you want
  fetchSubscriberTokens,
};
