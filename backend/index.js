// ========================== IMPORTS ==========================
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// --- Internal Modules ---
const { connectDB } = require("./config/db");
const { fetchNews } = require("./FetchingNews");
const { summarizeNewsArticles } = require("./Summarizing");
const { saveArticles, getArticlesByTopic, getArticles } = require("./services/ArticleService");
const { translationController } = require("./translation-and-speech/controller/translationController");
const { handleTextToSpeech } = require("./translation-and-speech/controller/textToSpeechController");
const { getProfileById, updateProfile, createProfile } = require("./services/ProfileService");
const { sync, deleteUser } = require("./auth/controllers/authController");
const { fetchLiveStreams } = require("./services/youtube-service/youtubeController");
const { sendVerification, sendPasswordReset } = require("./auth/controllers/emailController");
const { handleSupportRequest } = require("./support/controller/supportController");
const recommendationsRouter = require("./routes/recommendations");
const activitiesRouter = require("./routes/activities");
const bookmarksRouter = require("./routes/bookmarks");
const { fetchAndSaveMultipleCategories } = require("./src/cron/fetchAndSaveNews");
const { initNotifier, fetchSubscriberTokens } = require("./src/services/notifier");

// Load environment variables
dotenv.config();

// ========================== APP INIT ==========================
const app = express();
const port = process.env.PORT || 4000;

// ========================== CORS ==========================
const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      console.warn("Blocked origin:", origin, "Allowed:", allowedOrigins);
      // Intentionally not calling callback for blocked origins (same as original behavior)
    },
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// =============================================================
// ======================= NEWS ROUTES =========================
// =============================================================

// Latest (all categories)
app.get("/get-summarized-news", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const forceLive = req.query.live === "1";
    console.log(`\nRetrieving ${limit ? limit : "all"} articles (All). forceLive=${forceLive}`);

    let articles = [];
    if (!forceLive) {
      articles = await getArticles({ limit });
    }

    if (!articles || articles.length === 0) {
      console.log("No cached articles or live requested — fetching...");
      const newsArticles = await fetchNews("all", 15);
      const articlesWithContent = newsArticles.filter(a => a.title && a.link);
      if (!articlesWithContent.length) {
        return res.status(404).json({ message: "No news articles found." });
      }
      const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 8));
      try {
        const saveResult = await saveArticles(summarizedNews);
        console.log(`Auto-saved ${saveResult.count} (errors: ${saveResult.errors.length})`);
      } catch (saveErr) {
        console.warn("Auto-save failed:", saveErr.message);
      }
      return res.json({
        category: "All",
        location: "India",
        count: summarizedNews.length,
        summarizedNews,
      });
    }

    res.json({
      category: "All",
      location: "India",
      count: articles.length,
      summarizedNews: articles,
    });
  } catch (err) {
    console.error("Error reading/fetching articles:", err);
    res.status(500).json({ error: "Error retrieving news." });
  }
});

// Category-specific
app.get("/get-summarized-news/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const limit = parseInt(req.query.limit) || null;
    console.log(`\nRetrieving ${limit ? limit : "all"} articles for category: ${category}`);
    const articles = await getArticlesByTopic(category, limit);
    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: `No news found in database for category: ${category}` });
    }
    res.json({
      category,
      location: "India",
      count: articles.length,
      summarizedNews: articles,
    });
  } catch (err) {
    console.error(`Error fetching articles by topic ${category}:`, err);
    res.status(500).json({ error: "Error retrieving news from database." });
  }
});

// Manual fetch & save
app.post("/save-articles", async (req, res) => {
  try {
    const category = req.query.category || "all";
    console.log(`\nFetching & saving ${category} news...`);
    const newsArticles = await fetchNews(category, 15);
    console.log(`Fetched ${newsArticles.length}`);
    const articlesWithContent = newsArticles.filter(a => a.title && a.link);
    console.log(`Filtered to ${articlesWithContent.length} with content`);
    if (!articlesWithContent.length) {
      return res.status(404).json({ message: "No articles to save." });
    }
    console.log("Summarizing...");
    const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 8));
    console.log(`Summarized ${summarizedNews.length}`);
    console.log("Saving to DB...");
    const result = await saveArticles(summarizedNews);
    res.json({
      message: "Articles saved successfully",
      saved: result.count,
      total: summarizedNews.length,
      errors: result.errors.length,
      errorDetails: result.errors,
    });
  } catch (err) {
    console.error("Error saving articles:", err);
    res.status(500).json({ error: "Error saving articles to database.", details: err.message });
  }
});

// Raw articles list
app.get("/articles", async (req, res) => {
  try {
    const topic = req.query.topic;
    const limit = parseInt(req.query.limit) || 20;
    const articles = topic ? await getArticlesByTopic(topic, limit) : await getArticles({ limit });
    res.json({ count: articles.length, articles });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Error fetching articles from database." });
  }
});

// =============================================================
// ================= TRANSLATION & TTS =========================
// =============================================================
app.post("/api/translation", translationController);
app.post("/api/tts", handleTextToSpeech);

// =============================================================
// ======================= PROFILE =============================
// =============================================================
app.post("/api/profiles", async (req, res) => {
  try {
    const profileData = req.body;
    const newProfile = await createProfile(profileData);
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: "Error creating profile", error: error.message });
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error getting profile", error: error.message });
  }
});

app.put("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log(`PUT /api/profiles/${id} - Received update:`, JSON.stringify(updateData));
    const updatedProfile = await updateProfile(id, updateData);
    console.log("Profile updated:", { id: updatedProfile.id, categories: updatedProfile.categories });
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error(`Error updating profile ${req.params.id}:`, error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

app.post("/api/auth/sync", (req, res) => sync(req, res));
app.delete("/api/auth/delete-user", deleteUser);

app.get("/api/profiles/check-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { excludeId } = req.query;
    if (!username) return res.status(400).json({ message: "Username is required" });
    const { isUsernameTaken } = require("./services/ProfileService");
    const taken = await isUsernameTaken(username, excludeId);
    res.status(200).json({ available: !taken, username });
  } catch (error) {
    res.status(500).json({ message: "Error checking username", error: error.message });
  }
});

// =============================================================
// ======================= EMAIL ===============================
// =============================================================
app.post("/api/auth/send-verification-email", sendVerification);
app.post("/api/auth/send-password-reset-email", sendPasswordReset);

// =============================================================
// ===================== LIVESTREAMS ===========================
// =============================================================
app.get("/api/live-streams", fetchLiveStreams);

// =============================================================
// ====================== SUPPORT ==============================
// =============================================================
app.post("/api/support/request", handleSupportRequest);

// =============================================================
// =================== RECOMMENDATIONS =========================
// =============================================================
app.use("/api/recommendations", recommendationsRouter);

// =============================================================
// =================== ACTIVITIES (ML) =========================
// =============================================================
app.use(activitiesRouter);

// =============================================================
// ====================== BOOKMARKS ============================
// =============================================================
app.use(bookmarksRouter);

// =============================================================
// ======================== DEBUG ==============================
// =============================================================
app.get("/api/debug/subscribers/:category", async (req, res) => {
  try {
    const category = String(req.params.category || "").toLowerCase();
    const tokens = await fetchSubscriberTokens(category);
    res.json({ category, tokenCount: tokens.length, sample: tokens.slice(0, 3) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================================
// ========================= CRON ==============================
// =============================================================
app.post("/cron/fetch-latest", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = req.headers["x-cron-secret"] || req.query.secret;
    if (!provided || provided !== cronSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  const categories = req.body?.categories || ["all"];
  const newsCount = parseInt(req.body?.newsCount) || 15;
  const summarizeLimit = parseInt(req.body?.summarizeLimit) || 8;
  fetchAndSaveMultipleCategories(categories, newsCount, summarizeLimit)
    .then(results => console.log("Cron worker completed", results))
    .catch(err => console.error("Cron worker failed:", err.message));
  res.json({ status: "accepted", categories, newsCount, summarizeLimit });
});

// =============================================================
// ===================== SPA FRONTEND ==========================
// =============================================================
const distDir = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/cron")) return next();
  res.sendFile(path.join(distDir, "index.html"));
});

// =============================================================
// ====================== START SERVER =========================
// =============================================================
async function startServer() {
  try {
    await connectDB();
    try {
      initNotifier();
      console.log("Notifier initialized.");
    } catch (e) {
      console.warn("Notifier failed to initialize:", e.message);
    }
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Server start failed:", err);
  }
}

startServer();
