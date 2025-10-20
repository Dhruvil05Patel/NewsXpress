const express = require("express");
const dotenv = require("dotenv");
const { fetchNews } = require("./FetchingNews");
const { summarizeNewsArticles } = require("./Summarizing");
const { connectDB } = require("./config/db");
const { saveArticles, getArticlesByTopic, getArticles } = require("./ArticleService");
const cors = require("cors");

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

// Default route: fetch latest news (all categories)
app.get("/get-summarized-news", async (req, res) => {
  try {
    console.log("\n Fetching news for category: All");
    const newsArticles = await fetchNews("all", 15);
    const articlesWithContent = newsArticles.filter(a => a.title && a.link);

    if (!articlesWithContent.length)
      return res.status(404).json({ message: "No news articles found." });

    console.log(`🤖 Summarizing ${articlesWithContent.length} articles...`);
    const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 8));

    //  Save to database in background (don't wait for completion)
    saveArticles(summarizedNews)
      .then(result => {
        console.log(` Saved ${result.count} articles to database`);
      })
      .catch(err => {
        console.error(" Error saving to database:", err.message);
      });

    res.json({
      category: "All",
      location: "India",
      count: summarizedNews.length,
      summarizedNews
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching or summarizing news." });
  }
});

//  Category-based routes (dynamic)
app.get("/get-summarized-news/:category", async (req, res) => {
  const category = req.params.category;

  try {
    console.log(`\n Fetching news for category: ${category}`);
    const newsArticles = await fetchNews(category, 15);
    const articlesWithContent = newsArticles.filter(a => a.title && a.link);

    if (!articlesWithContent.length)
      return res.status(404).json({
        message: `No news found for category: ${category}`
      });

    console.log(`🤖 Summarizing ${articlesWithContent.length} articles...`);
    const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 8));

    //  Save to database in background (don't wait for completion)
    saveArticles(summarizedNews)
      .then(result => {
        console.log(` Saved ${result.count} articles to database for category: ${category}`);
      })
      .catch(err => {
        console.error(` Error saving to database for category ${category}:`, err.message);
      });

    res.json({
      category,
      location: "India",
      count: summarizedNews.length,
      summarizedNews
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching or summarizing news." });
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

// =================== SERVER START =================== //
connectDB().then(() => {
  app.listen(port, () => {
    console.log(` Server running on http://localhost:${port}`);
  });
});
