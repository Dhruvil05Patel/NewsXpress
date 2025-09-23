const express = require("express"); // Importing the essential web framework library for building APIs
const dotenv = require("dotenv"); // For loading environment variables from .env
const { fetchNews } = require("./FetchingNews"); // Custom function to fetch news articles
const { summarizeNewsArticles } = require("./Summarizing"); // Custom function to summarize articles
const { connectDB } = require("./config/db"); // Database connection function (Sequelize + Supabase)
const cors = require("cors"); // Middleware to enable CORS for cross-origin requests

dotenv.config(); // Initialize dotenv to access environment variables

const app = express(); // Create an Express application
const port = process.env.PORT || 5000; // Use PORT from .env or default to 5000

app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Enable CORS for frontend requests
// =================== ROUTES =================== //
app.get("/get-summarized-news", async (req, res) => {
  // Endpoint: GET request to fetch summarized news

  const query = "Gujarat"; // Default query term for news
  try {
    // 1️⃣ Fetch news articles from external API
    const newsArticles = await fetchNews(query);

    // If no articles were fetched, return "not found"
    if (!newsArticles.length) {
      return res.status(404).json({ message: "No news articles found." });
    }

    // 2️⃣ Filter only articles that have at least a title and a link
    const articlesWithContent = newsArticles.filter(
      (article) => article.title && article.link
    );

    // 3️⃣ Summarize only the first 5 articles (avoid overloading)
    const summarizedNews = await summarizeNewsArticles(
      articlesWithContent.slice(0, 8)
    );

    // 4️⃣ Send JSON response back to client
    res.json({
      query, // The query used for fetching
      count: summarizedNews.length, // Number of summarized articles
      summarizedNews, // The actual summaries
    });
  } catch (err) {
    // Error handling: If something goes wrong, send 500 Internal Server Error
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching or summarizing news." });
  }
});

// =================== SERVER START =================== //
// First connect to the database, then start the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running on http: //localhost:${port}`);
  });
});