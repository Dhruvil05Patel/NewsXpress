const fetch = require("node-fetch").default;
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

async function fetchNewsBySerpAPI(query = "India news", newsCount = 20) {
  // Build the SerpAPI URL with proper parameters
  const serpApiUrl = new URL("https://serpapi.com/search.json");
  serpApiUrl.searchParams.append("engine", "google_news");
  serpApiUrl.searchParams.append("q", query); // Search query
  serpApiUrl.searchParams.append("gl", "in"); // Location: India
  serpApiUrl.searchParams.append("hl", "en"); // Language: English
  serpApiUrl.searchParams.append("num", newsCount.toString()); // Number of results
  serpApiUrl.searchParams.append("api_key", SERPAPI_API_KEY);

  try {
    console.log(` Fetching news for query: "${query}"`);
    const response = await fetch(serpApiUrl.toString());
    const data = await response.json();

    if (data.error) {
      console.error("SerpAPI Error:", data.error);
      return [];
    }

    // Extract news results
    const newsResults = data.news_results || [];
    
    if (newsResults.length === 0) {
      console.warn(` No news results found for query: "${query}"`);
      return [];
    }

    console.log(` Found ${newsResults.length} articles for "${query}"`);

    // Map to consistent format
    return newsResults.map(article => ({
      title: article.title,
      link: article.link,
      source: article.source?.name || "Unknown",
      date: article.date,
      snippet: article.snippet,
      thumbnail: article.thumbnail,
      position: article.position,
    }));

  } catch (error) {
    // Network errors, JSON parsing errors, or other unexpected failures are caught here.
    console.error("Error fetching news from SerpAPI:", error.message);
    return [];
  }
}

/**
 * Main function: Fetch news by category
 */
async function fetchNews(category = "all", newsCount = 15) {
  try {
    // Build search query based on category
    let query;
    
    if (category === "all" || category === "All") {
      query = "India latest news"; // General news
    } else {
      query = `India ${category} news`; // Category-specific news
    }

    // Fetch news using SerpAPI
    const newsArticles = await fetchNewsBySerpAPI(query, newsCount);

    if (newsArticles.length === 0) {
      console.warn(`⚠️ No articles found for category: ${category}`);
    }

    return newsArticles;

  } catch (error) {
    // Catch any unexpected errors during query construction or API calls
    console.error("Error in fetchNews:", error.message);
    return [];
  }
}

module.exports = { fetchNews };
