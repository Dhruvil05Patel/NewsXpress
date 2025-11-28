const admin = require("../../config/firebaseAdmin");

/**
 * Fetch live streams from Firebase Realtime Database at path `ytlive/new/items`.
 * The DB stores items under numeric keys ("0".."19") using the same structure
 * as the YouTube API (each entry contains etag, snippet, thumbnails, etc.).
 *
 * @param {number} maxResults number of items to return (default 20)
 * @returns {Promise<Array>} array of item objects (may be empty)
 */
const getLiveStreams = async (maxResults = 20) => {
  try {
    const db = admin.database();
    const ref = db.ref("ytlive/news/items");
    const snap = await ref.once("value");

    const val = snap.val();
    if (!val) {
      // no data at path
      return [];
    }

    // val is expected to be an object with numeric keys '0', '1', ... or an array-like object
    const items = Array.isArray(val)
      ? val.filter(Boolean)
      : Object.keys(val)
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => val[k]);

    // Return up to maxResults
    return items.slice(0, maxResults);
  } catch (error) {
    console.error("Error fetching live streams from Realtime DB:", error);
    // Propagate error so callers can handle it; alternatively return [] if preferred
    throw error;
  }
};

module.exports = { getLiveStreams };