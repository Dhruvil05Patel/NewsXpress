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
    
    // Check if app already exists, use it instead of creating new one
    if (admin.apps.length > 0) {
      console.log("Firebase Admin app already exists, reusing existing instance.");
      initialized = true;
      return;
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    initialized = true;
    console.log("Firebase Admin initialized for notifier.");
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err.message);
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
    const arrayFields = ['categories', 'topics', 'actor', 'subscriptions', 'device_topics'];
    const foundArrayField = arrayFields.find((f) => !!attrs[f]);
    const where = {};

    if (foundArrayField) {
      // Postgres array overlap (check if category is in the array)
      // Categories stored in lowercase, so normalize the input
      const normalizedCategory = category.toLowerCase();
      where[foundArrayField] = { [Op.overlap]: [normalizedCategory] };
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
    const rows = await db.Profile.findAll({ where, attributes: ['id', 'email', tokenField, foundArrayField] });
    const tokens = [];
    let withToken = 0;
    
    console.log(`\n🔍 fetchSubscriberTokens for category="${category}":`);
    console.log(`   Field used: ${foundArrayField}, Token field: ${tokenField}`);
    console.log(`   Found ${rows.length} matching profiles`);
    
    for (const r of rows) {
      const val = r.get(tokenField);
      const userCategories = r.get(foundArrayField);
      
      console.log(`   - Profile ${r.id} (${r.email}): categories=${JSON.stringify(userCategories)}, hasToken=${!!val}`);
      
      if (!val) continue;
      if (Array.isArray(val)) {
        tokens.push(...val.filter(Boolean));
      } else if (typeof val === 'string') {
        tokens.push(val);
      }
      withToken += 1;
    }

    // Deduplicate
    const uniq = Array.from(new Set(tokens));
    console.log(`✅ Result: ${withToken} profiles with tokens, ${uniq.length} unique tokens\n`);
    return uniq;
  } catch (err) {
    console.error('fetchSubscriberTokens error:', err.message);
    return [];
  }
}

/**
 * Send notification payload to a list of tokens (handles batching)
 */
// Simple in-memory idempotency cache to prevent duplicate sends for same article+category
// Key format: `${category}|${idOrTitle}`; value: timestamp ms
const _sentCache = new Map();
const _inFlight = new Set(); // prevent concurrent duplicate notifications for same key
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:4000';

function _shouldSkip(category, article) {
  const idOrTitle = article.id || article.title || 'unknown';
  const key = `${(category || '').toLowerCase()}|${idOrTitle}`;
  const now = Date.now();
  const existing = _sentCache.get(key);
  if (existing && now - existing < CACHE_TTL_MS) {
    return true; // recently sent
  }
  _sentCache.set(key, now);
  // Periodically prune old entries
  if (_sentCache.size > 500) {
    for (const [k, ts] of _sentCache.entries()) {
      if (now - ts > CACHE_TTL_MS) _sentCache.delete(k);
    }
  }
  return false;
}

async function sendNotificationToTokens(tokens = [], payload = {}) {
  if (!initialized) {
    console.warn("Notifier not initialized. Call initNotifier() at server startup.");
    return { success: false, reason: "not-initialized" };
  }
  if (!tokens || tokens.length === 0) {
    return { success: true, sent: 0 };
  }

  const messaging = admin.messaging();
  let successCount = 0;
  let failCount = 0;

  // Send to each token individually (more reliable than sendMulticast with reused app)
  for (const token of tokens) {
    const key = `${payload.data?.category || 'unknown'}|${payload.data?.id || payload.title}`;
    if (_inFlight.has(key)) {
      console.log(`⏳ In-flight duplicate suppressed for ${key}`);
      continue;
    }
    _inFlight.add(key);
    try {
      await messaging.send({
        token: token,
        webpush: {
          notification: {
            title: payload.title || "NewsXpress: new article",
            body: payload.body || "Tap to read",
            icon: `${PUBLIC_BASE_URL.replace(/\/$/, '')}/logo.png`,
            image: payload.data?.image || undefined,
            data: {
              url: payload.data?.url || "",
              id: payload.data?.id || "",
              category: payload.data?.category || "",
              summary: payload.body || "",
            }
          },
          fcmOptions: {
            link: payload.data?.url || '/' // click opens article
          }
        }
      });
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`FCM send error for token ${token.substring(0, 20)}...:`, err.message);
    } finally {
      _inFlight.delete(key);
    }
  }

  console.log(`FCM: sent ${successCount}/${tokens.length} notifications (${failCount} failed)`);
  return { success: true, sent: successCount, failed: failCount };
}

/**
 * Public helper: find tokens for a category and notify them about `article`
 * - `article` should contain { title, summary, newsUrl, category, imageUrl }
 */
async function notifySubscribersForCategory(category, article = {}) {
  try {
    // Normalize category to lowercase for consistent matching
    const normalizedCategory = category.toLowerCase();
    
    console.log(`\n📢 notifySubscribersForCategory called:`);
    console.log(`   Category: "${category}" -> normalized: "${normalizedCategory}"`);
    console.log(`   Article: ${article.title?.slice(0, 50)}...`);
    
    const tokens = await fetchSubscriberTokens(normalizedCategory);
    if (!tokens || tokens.length === 0) {
      console.log(`⚠️  No subscribed tokens for category=${normalizedCategory}\n`);
      return { success: true, sent: 0 };
    }

    // Idempotency check: skip if already sent recently for this article+category
    if (_shouldSkip(normalizedCategory, article)) {
      console.log(`⏩ Skipping duplicate notification for category='${normalizedCategory}' article='${article.title?.slice(0,40)}'`);
      return { success: true, sent: 0, skipped: true };
    }

    const rawImage = article.image_url || article.imageUrl || "";
    const absoluteImage = rawImage && /^https?:\/\//.test(rawImage)
      ? rawImage
      : (rawImage ? `${PUBLIC_BASE_URL.replace(/\/$/, '')}/${rawImage.replace(/^\//,'')}` : "");

    const payload = {
        title: `New ${category} update: ${article.title?.slice(0, 60)}`,
        body: limitWords(article.summary, 100) || "New article published",
      data: {
        url: article.newsUrl || article.original_url || "",
        id: article.id || "",
        category: normalizedCategory,
        image: absoluteImage,
          summary: limitWords(article.summary, 100) || "",
      },
    };

    console.log(`📤 Sending to ${tokens.length} tokens...`);
    const result = await sendNotificationToTokens(tokens, payload);
    console.log(`✅ Notification result:`, result, '\n');
    return result;
  } catch (err) {
    console.error("❌ notifySubscribersForCategory error:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  initNotifier,
  notifySubscribersForCategory,
  // export fetchSubscriberTokens for you to implement if you want
  fetchSubscriberTokens,
};

// Helper: limit text to N words
function limitWords(text, maxWords = 100) {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}
