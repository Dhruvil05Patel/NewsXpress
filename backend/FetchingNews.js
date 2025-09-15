const fetch = require("node-fetch").default;  // Loading the essential library
const dotenv = require("dotenv");

dotenv.config(); // Initialize dotenv to access environment variables

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY; // SerpApi Key from .env file

async function fetchNews(query, newsCount = 5) {  // Fetch news articles from SerpApi
  const serpApiUrl = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(
    query
  )}&num=${newsCount}&api_key=${SERPAPI_API_KEY}`;

  try {
    const response = await fetch(serpApiUrl);
    const data = await response.json();

    if (data.error) {
      throw new Error("Failed to fetch news from SerpApi");
    }

    return data.news_results || [];
  } catch (error) {
    console.error("Error fetching news:", error.message);
    return [];
  }
}

module.exports = { fetchNews };