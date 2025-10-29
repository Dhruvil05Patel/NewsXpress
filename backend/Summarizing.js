const { Groq } = require("groq-sdk"); // Loading the essential library
const dotenv = require("dotenv"); 

dotenv.config(); // Load environment variables from .env into process.env

// Read API key from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function summarizeArticle(article, maxRetries = 3) {  
  // Construct the prompt for comprehensive analysis
  const prompt = `
Analyze the following news article and extract information in JSON format.

Title: "${article.title}"
Link: ${article.link}
${article.snippet ? `Content: ${article.snippet}` : ""}

Return a JSON object with these fields:
- summary: A concise 2-3 sentence summary of the article
- sentiment: A sentiment score from -1.0 (very negative) to 1.0 (very positive), use 0.0 for neutral
- actors: An array of key people, organizations, or entities mentioned (max 5)
- place: The primary location/city/country mentioned in the article
- topic: The main category (e.g., "Politics", "Technology", "Sports", "Business", "Health", "Entertainment", "Science", "Crime", "Environment", "World")
- subtopic: A more specific subcategory or theme

Return ONLY valid JSON, no additional text or formatting.
`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        max_tokens: 500,
        temperature: 0.3,
      });

      const responseText = resp.choices[0]?.message?.content?.trim();
      
      if (responseText) {
        // Try to parse JSON response
        try {
          const parsed = JSON.parse(responseText);
          return {
            summary: parsed.summary || "Summary unavailable.",
            sentiment: parsed.sentiment || 0.0,
            actors: Array.isArray(parsed.actors) ? parsed.actors : [],
            place: parsed.place || null,
            topic: parsed.topic || "General",
            subtopic: parsed.subtopic || null,
          };
        } catch (parseError) {
          console.warn(`Failed to parse JSON for "${article.title}", using fallback...`);
          // Fallback: return simple summary
          return {
            summary: responseText,
            sentiment: 0.0,
            actors: [],
            place: null,
            topic: "General",
            subtopic: null,
          };
        }
      }
    } catch (error) {
      // Log the error for debugging.
      console.error(
        `Groq analysis failed for "${article.title}" (attempt ${attempt}):`,
        error.message
      );

      if (error.message.includes("429")) {
        const retryDelay = 5000 * attempt;
        console.log(`Rate limit hit. Retrying in ${retryDelay / 1000}s...`);
        await new Promise((r) => setTimeout(r, retryDelay));
      } else if (attempt === maxRetries) {
        // On final failure, return a generic error-shaped object so the caller
        // can still persist an article record if desired.
        return {
          summary: "Summary unavailable due to API error.",
          sentiment: 0.0,
          actors: [],
          place: null,
          topic: "General",
          subtopic: null,
        };
      }
    }
  }
  
  // Fallback if all retries fail
  return {
    summary: "Summary unavailable.",
    sentiment: 0.0,
    actors: [],
    place: null,
    topic: "General",
    subtopic: null,
  };
}

/**
 * summarizeNewsArticles
 * - Takes an array of raw article objects (from the fetcher) and returns an
 *   array of objects shaped for insertion into the database.
 * - Performs per-article summarization by calling summarizeArticle.
 * - Adds derived fields like `readTime`, normalizes dates, and copies fields
 *   expected by the DB schema used elsewhere in the project.
 */
async function summarizeNewsArticles(articles) {
  const summarizedNews = [];

  for (const article of articles) {
    const analysis = await summarizeArticle(article, 3);
    
    // Calculate read time based on summary length
    const readTime = Math.max(1, Math.ceil((analysis.summary.length / 200)));
    
    // Parse published date or use current time as fallback
    let publishedAt = new Date();
    if (article.date) {
      const parsedDate = new Date(article.date);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate;
      }
    }
    
    // Build article object matching database schema
    summarizedNews.push({
      // Database fields
      title: article.title,
      summary: analysis.summary,
      original_url: article.link,
      published_at: publishedAt,
      content_text: article.snippet || null,
      language_code: "en-IN",
      image_url: article.thumbnail || null,
      sentiment: analysis.sentiment,
      actors: analysis.actors,
      place: analysis.place,
      topic: analysis.topic,
      subtopic: analysis.subtopic,

      // Additional fields used by frontend or other modules (camelCase)
      source: article.source || "Unknown Source",
      timestamp: article.date || "Recently",
      readTime: `${readTime} min read`,
      newsUrl: article.link,
      imageUrl: article.thumbnail || null,
      category: analysis.topic,
    });
  }

  return summarizedNews;
}

module.exports = { summarizeArticle, summarizeNewsArticles };