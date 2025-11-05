const express = require("express");
const dotenv = require("dotenv");
const { fetchNews } = require("./FetchingNews");
const { summarizeNewsArticles } = require("./Summarizing");

const { connectDB } = require("./config/db");
const { saveArticles, getArticlesByTopic, getArticles } = require("./services/ArticleService");
const {translationController} = require("./translation-and-speech/controller/translationController")

const cors = require("cors");
const { handleTextToSpeech } = require("./translation-and-speech/controller/textToSpeechController");

const { getProfileById, updateProfile } = require("./services/ProfileService");
const { addBookmark, removeBookmark, getBookmarksByProfile } = require("./services/UserInteractionService");
// ================================================================= //
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration - allow multiple origins
const corsOptions = {
  origin: [
    "http://localhost:5173",  // Frontend Vite dev server
    "http://localhost:3000",  // Alternative React dev server
    "http://localhost:4000",  // Backend itself (for direct browser access)
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies


// =================== MAIN ROUTES =================== //

// Default route: read latest news directly from DB
app.get("/get-summarized-news", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const forceLive = req.query.live === '1'; // pass ?live=1 to force a fresh fetch
    console.log(`\n Retrieving latest ${limit} articles from database (All). forceLive=${forceLive}`);

    let articles = [];
    if (!forceLive) {
      // Try DB first
      articles = await getArticles({ limit });
    }

    if (!articles || articles.length === 0) {
      // DB empty or forced live — fetch + summarize
      console.log("No articles in DB or live fetch requested — fetching live news...");
      const newsArticles = await fetchNews("all", 15);
      const articlesWithContent = newsArticles.filter(a => a.title && a.link);
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
    const limit = parseInt(req.query.limit) || 15;
    console.log(`\n Retrieving up to ${limit} articles from database for category: ${category}`);

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
    
    const articlesWithContent = newsArticles.filter(a => a.title && a.link);
    console.log(` Filtered to ${articlesWithContent.length} articles with content`);

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

app.post('/api/translation' , translationController)
app.post('/api/tts' , handleTextToSpeech)

// =================== PROFILE ROUTES =================== //
// (These routes use new ProfileService)

// GET a user's profile by their ID
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getProfileById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error getting profile', error: error.message });
  }
});

// UPDATE a user's profile (for preferences)
app.put('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 
    
    const updatedProfile = await updateProfile(id, updateData);
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});


// =================== (NEW) BOOKMARK ROUTES =================== //
// (These routes use new UserInteractionService)

// GET all bookmarks for a user
app.get('/api/bookmarks/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const bookmarks = await getBookmarksByProfile(profileId);
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Error getting bookmarks', error: error.message });
  }
});

// ADD a new bookmark
app.post('/api/bookmarks', async (req, res) => {
  try {
    const { profile_id, article_id, note } = req.body;
    if (!profile_id || !article_id) {
      return res.status(400).json({ message: 'profile_id and article_id are required' });
    }
    const bookmark = await addBookmark(profile_id, article_id, note);
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Error adding bookmark', error: error.message });
  }
});

// REMOVE a bookmark
app.delete('/api/bookmarks', async (req, res) => {
  try {
    const { profile_id, article_id } = req.body;
    if (!profile_id || !article_id) {
      return res.status(400).json({ message: 'profile_id and article_id are required' });
    }
    await removeBookmark(profile_id, article_id);
    res.status(200).json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing bookmark', error: error.message });
  }
});

// =================== SERVER START =================== //
connectDB().then(() => {
  app.listen(port, () => {
    console.log(` Server running on http://localhost:${port}`);
  });
});

