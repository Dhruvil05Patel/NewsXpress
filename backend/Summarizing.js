const { Groq } = require("groq-sdk"); // Loading the essential library
const dotenv = require("dotenv"); 

dotenv.config();  // Initialize dotenv to access environment variables

const GROQ_API_KEY = process.env.GROQ_API_KEY;  //Groq API Key from .env file
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function summarizeArticle(article, maxRetries = 3) {  
  // Construct the prompt for summarization
  const prompt = `
Summarize the following news article in one short paragraph.
Return only the summary text, no JSON or extra formatting.

Title: "${article.title}"
Link: ${article.link}
${article.snippet ? `Content: ${article.snippet}` : ""}
`;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        max_tokens: 300,
        temperature: 0.4,
      });

      const summary = resp.choices[0]?.message?.content?.trim();
      if (summary) return summary;
    } catch (error) {
      console.error(
        `Groq summarization failed for "${article.title}" (attempt ${attempt}):`,
        error.message
      );

      if (error.message.includes("429")) {
        const retryDelay = 5000 * attempt;
        console.log(`Rate limit hit. Retrying in ${retryDelay / 1000}s...`);
        await new Promise((r) => setTimeout(r, retryDelay));
      } else if (attempt === maxRetries) {
        return "Summary unavailable due to API error.";
      }
    }
  }
  return "Summary unavailable.";  // Fallback summary if all retries fail
}

async function summarizeNewsArticles(articles) {  //Summarize multiple articles
  const summarizedNews = [];
  for (const article of articles) {
    const summary = await summarizeArticle(article, 3);
    summarizedNews.push({
      title: article.title,
      source: article.source?.name || "Unknown Source",
      link: article.link,
      summary,
    });
  }
  return summarizedNews;
}

module.exports = { summarizeArticle, summarizeNewsArticles };