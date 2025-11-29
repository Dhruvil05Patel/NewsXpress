const express = require("express");
const dotenv = require("dotenv");
const { fetchNews } = require("./FetchingNews");
const { summarizeNewsArticles } = require("./Summarizing");

const { connectDB } = require("./config/db");
const { saveArticles, getArticlesByTopic, getArticles } = require("./services/ArticleService");
const {translationController} = require("./translation-and-speech/controller/translationController")

const cors = require("cors");
const { handleTextToSpeech } = require("./translation-and-speech/controller/textToSpeechController");

const { getProfileById, updateProfile, createProfile } = require("./services/ProfileService");
const { sync, deleteUser } = require('./auth/controllers/authController');
const { addBookmark, removeBookmark, getBookmarksByProfile } = require("./services/UserInteractionService");
const { fetchLiveStreams } = require("./services/youtube-service/youtubeController");
const { sendVerification, sendPasswordReset } = require("./auth/controllers/emailController");
const {handleSupportRequest} = require("./support/controller/supportController");
const recommendationsRouter = require("./routes/recommendations");
const activitiesRouter = require("./routes/activities");
const bookmarksRouter = require("./routes/bookmarks");
// ================================================================= //
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
].filter(Boolean); 

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin 
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Allowed origins:`, allowedOrigins);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies


// =================== MAIN ROUTES =================== //

// Default route: read latest news directly from DB
app.get("/get-summarized-news", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const forceLive = req.query.live === "1"; // pass ?live=1 to force a fresh fetch
    console.log(
      `\n Retrieving ${
        limit ? limit : "all"
      } articles from database (All). forceLive=${forceLive}`
    );

    let articles = [];
    if (!forceLive) {
      // Try DB first
      articles = await getArticles({ limit });
    }

    if (!articles || articles.length === 0) {
      // DB empty or forced live — fetch + summarize
      console.log("No articles in DB or live fetch requested — fetching live news...");
      const newsArticles = await fetchNews("all", 15);
      const articlesWithContent = newsArticles.filter((a) => a.title && a.link);
      if (!articlesWithContent.length) {
        return res.status(404).json({ message: "No news articles found." });
      }
      const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 8));

      // Optionally save results to DB (comment out if you don't want auto-saving)
      try {
        const saveResult = await saveArticles(summarizedNews);
        console.log(`Auto-saved ${saveResult.count} articles (errors: ${saveResult.errors.length})`);
      } catch (saveErr) {
        console.warn("Auto-save failed:", saveErr);
      }

      return res.json({
        category: "All",
        location: "India",
        count: summarizedNews.length,
        summarizedNews
      });
    }

    // Return DB results
    res.json({
      category: "All",
      location: "India",
      count: articles.length,
      summarizedNews: articles
    });
  } catch (err) {
    console.error("Error reading/fetching articles:", err);
    res.status(500).json({ error: "Error retrieving news." });
  }
});

// Category-based route: read by topic from DB
app.get("/get-summarized-news/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const limit = parseInt(req.query.limit) || null;
    console.log(
      `\n Retrieving ${
        limit ? limit : "all"
      } articles from database for category: ${category}`
    );

    const articles = await getArticlesByTopic(category, limit);

    if (!articles || articles.length === 0) {
      return res.status(404).json({
        message: `No news found in database for category: ${category}`
      });
    }

    res.json({
      category,
      location: "India",
      count: articles.length,
      summarizedNews: articles
    });
  } catch (err) {
    console.error(`Error fetching articles by topic ${category}:`, err);
    res.status(500).json({ error: "Error retrieving news from database." });
  }
});

//  Save fetched articles to database
app.post("/save-articles", async (req, res) => {
  try {
    const category = req.query.category || "all";

    console.log(`\n Fetching and saving ${category} news to database...`);
      
    const newsArticles = await fetchNews(category, 15);
    console.log(` Fetched ${newsArticles.length} articles from news API`);
    
    const articlesWithContent = newsArticles.filter((a) => a.title && a.link);
    console.log(
      ` Filtered to ${articlesWithContent.length} articles with content`
    );

    if (!articlesWithContent.length) {
      return res.status(404).json({ message: "No articles to save." });
    }

    console.log(` Summarizing articles with AI...`);
    const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 8));
    console.log(` Summarized ${summarizedNews.length} articles`);
    
    console.log(` Saving to database...`);
    const result = await saveArticles(summarizedNews);

    res.json({
      message: "Articles saved successfully",
      saved: result.count,
      total: summarizedNews.length,
      errors: result.errors.length,
      errorDetails: result.errors,
    });
  } catch (err) {
    console.error(" Error saving articles:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ 
      error: "Error saving articles to database.",
      details: err.message 
    });
  }
});

// Get articles from database
app.get("/articles", async (req, res) => {
  try {
    const topic = req.query.topic;
    const limit = parseInt(req.query.limit) || 20;

    let articles;
    if (topic) {
      articles = await getArticlesByTopic(topic, limit);
    } else {
      articles = await getArticles({ limit });
    }

    res.json({
      count: articles.length,
      articles,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching articles from database." });
  }
});


// =================== TRANSLATION & TTS ROUTES =================== //

app.post("/api/translation", translationController);
app.post("/api/tts", handleTextToSpeech);

// =================== PROFILE ROUTES =================== //
// (These routes use new ProfileService)

// (NEW) CREATE a new profile
app.post("/api/profiles", async (req, res) => {
  try {
    const profileData = req.body; // e.g., { fullName, username, authId }
    
    // Call the service function we just imported
    const newProfile = await createProfile(profileData);
    
    res.status(201).json(newProfile); // 201 means "Created"
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile', error: error.message });
  }
});

// GET a user's profile by their ID
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getProfileById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting profile", error: error.message });
  }
});

// UPDATE a user's profile (for preferences)
app.put("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`PUT /api/profiles/${id} - Received update:`, JSON.stringify(updateData, null, 2));
    
    const updatedProfile = await updateProfile(id, updateData);
    
    console.log(`Profile updated successfully:`, {
      id: updatedProfile.id,
      categories: updatedProfile.categories,
      fcm_token: updatedProfile.fcm_token ? `${updatedProfile.fcm_token.substring(0, 20)}...` : null
    });
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error(`❌ Error updating profile ${id}:`, error.message);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// Endpoint to sync Firebase-authenticated user to local profiles table
app.post("/api/auth/sync", async (req, res) => {
  // Delegates to controllers/authController.sync
  return sync(req, res);
});

// CHECK if username is available
app.get("/api/profiles/check-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { excludeId } = req.query; // Optional: profile ID to exclude from check
    
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    
    const { isUsernameTaken } = require('./services/ProfileService');
    const taken = await isUsernameTaken(username, excludeId);
    
    res.status(200).json({ 
      available: !taken,
      username: username 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error checking username", 
      error: error.message 
    });
  }
});

//USER DELETION ROUTE 
app.delete("/api/auth/delete-user", deleteUser);


// =================== EMAIL ROUTES =================== //
app.post("/api/auth/send-verification-email", sendVerification);
app.post("/api/auth/send-password-reset-email", sendPasswordReset);


// =================== LIVE STREAM ROUTE =================== //
app.get('/api/live-streams', fetchLiveStreams);

// =================== SUPPORT REQUEST ROUTE =================== //
app.post('/api/support/request', handleSupportRequest);

// =================== RECOMMENDATIONS ROUTES =================== //
app.use('/api/recommendations', recommendationsRouter);

// =================== USER ACTIVITIES ROUTES (ML Tracking) =================== //
app.use(activitiesRouter);

// =================== BOOKMARKS ROUTES =================== //
app.use(bookmarksRouter);

// =================== DEBUG NOTIFICATION ENDPOINTS =================== //
// List subscriber token stats for a category
app.get('/api/debug/subscribers/:category', async (req, res) => {
  try {
    const category = String(req.params.category || '').toLowerCase();
    const tokens = await fetchSubscriberTokens(category);
    res.json({ category, tokenCount: tokens.length, sample: tokens.slice(0, 3) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =================== SERVER START =================== //
// === Initialize components after DB connect ===
// Add notifier init and provide a lightweight cron endpoint for Render
const { fetchAndSaveMultipleCategories, fetchAndSaveNews } = require("./src/cron/fetchAndSaveNews");
const { initNotifier, fetchSubscriberTokens } = require("./src/services/notifier");

async function startServer() {
  try {
    await connectDB();
    console.log("DB connected at startup.");

    // Initialize notifier (Firebase Admin)
    try {
      initNotifier();
      console.log("Notifier initialized.");
    } catch (e) {
      console.warn("Notifier failed to initialize:", e.message);
    }

    // Start express server
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
  }
}

// === NEW: Cron endpoint that Render will call ===
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

  // Kick off heavy work but respond immediately
  fetchAndSaveMultipleCategories(categories, newsCount, summarizeLimit)
    .then(results => console.log("Cron worker completed", results))
    .catch(err => console.error("Cron worker failed:", err.message));

  res.json({ status: "accepted", categories, newsCount, summarizeLimit });
});

// Start server after establishing DB connection
startServer();

