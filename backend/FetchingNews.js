const fetch = require("node-fetch").default;
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const CATEGORIES = [
  "all",
  "technology",
  "business",
  "science",
  "sports",
  "environment",
  "politics",
  "health",
  "entertainment",
  "crime"
];

function getSerpApiKeys() {
  const keys = [];
  
  // Check for individual indexed environment variables (SERPAPI_API_KEY, SERPAPI_API_KEY_2, etc.)
  if (process.env.SERPAPI_API_KEY) {
    keys.push(process.env.SERPAPI_API_KEY.trim());
  }
  
  let index = 2;
  while (true) {
    const key = process.env[`SERPAPI_API_KEY_${index}`];
    if (!key) break;
    keys.push(key.trim());
    index++;
  }
  
  // De-duplicate keys while preserving order
  return [...new Set(keys)];
}

async function fetchNewsBySerpAPI(query = "India news", newsCount = 20, category = "all") {
  const keys = getSerpApiKeys();
  if (keys.length === 0) {
    console.error("No SerpAPI API keys configured.");
    return [];
  }

  // Find the category index in CATEGORIES (case-insensitive)
  const normCategory = String(category || "").toLowerCase();
  const catIndex = CATEGORIES.indexOf(normCategory);
  
  // Determine starting key index (0-1 -> Key 0, 2-3 -> Key 1, etc.)
  let startIndex = 0;
  if (catIndex !== -1) {
    startIndex = Math.floor(catIndex / 2) % keys.length;
  }

  // Iterate through all configured keys starting from startIndex (round-robin rotation)
  for (let step = 0; step < keys.length; step++) {
    const currentIdx = (startIndex + step) % keys.length;
    const currentKey = keys[currentIdx];
    
    const serpApiUrl = new URL("https://serpapi.com/search.json");
    serpApiUrl.searchParams.append("engine", "google_news");
    serpApiUrl.searchParams.append("q", query); // Search query
    serpApiUrl.searchParams.append("gl", "in"); // Location: India
    serpApiUrl.searchParams.append("hl", "en"); // Language: English
    serpApiUrl.searchParams.append("num", newsCount.toString()); // Number of results
    serpApiUrl.searchParams.append("api_key", currentKey);

    const maskedKey = currentKey.length > 6 ? `...${currentKey.slice(-6)}` : "***";
    try {
      console.log(`[Attempt ${step + 1}/${keys.length}] Fetching news for query: "${query}" using key index ${currentIdx} (${maskedKey})`);
      
      const response = await fetch(serpApiUrl.toString());
      
      // Handle response code issues (for backward compatibility with unmocked/mocked responses)
      const isOk = response.ok === undefined || response.ok === true || response.status === undefined || (response.status >= 200 && response.status < 300);
      if (!isOk) {
        console.warn(`SerpAPI HTTP Error ${response.status || 'unknown'} with key ${maskedKey}`);
        continue; // Try next key
      }

      const data = await response.json();

      if (data.error) {
        console.error(`SerpAPI Error with key ${maskedKey}:`, data.error);
        continue; // Try next key
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
      console.error(`Error fetching news from SerpAPI with key ${maskedKey}:`, error.message);
      // Proceed to try the next key
    }
  }

  console.error("All configured SerpAPI keys failed or were exhausted.");
  return [];
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

    // Fetch news using SerpAPI (pass the category so we can pick the appropriate key)
    const newsArticles = await fetchNewsBySerpAPI(query, newsCount, category);

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

module.exports = { fetchNewsBySerpAPI, fetchNews };

