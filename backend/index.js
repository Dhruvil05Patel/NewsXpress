const express = require("express"); // Importing the essential library
const dotenv = require("dotenv");
const { fetchNews } = require("./FetchingNews");
const { summarizeNewsArticles } = require("./Summarizing");

dotenv.config();  // Initialize dotenv to access environment variables

const app = express();
const port = 3000;

app.get("/get-summarized-news", async (req, res) => { // Endpoint to get summarized news
  const query = "Gujarati"; // Default query term (can be modified for the desired topic)
  try {
    const newsArticles = await fetchNews(query);

    if (!newsArticles.length) {
      return res.status(404).json({ message: "No news articles found." });
    }

    // Filter articles with at least a title and link
    const articlesWithContent = newsArticles.filter(
      article => article.title && article.link
    );

    // Only summarize up to 5 articles
    const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, 5));

    res.json({
      query,
      count: summarizedNews.length,
      summarizedNews,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching or summarizing news." }); // Error handling
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);  // Server listening on specified port (here 3000)
});
