/**
 * Article Database Operations
 * Helper functions to save and retrieve articles from the database
 */

// Importing only the models this service needs from the central db config
const { Article, Source } = require("../config/db");

/**
 * Find or create a news source
 */
async function findOrCreateSource(sourceName) {
  if (!sourceName || sourceName === "Unknown Source") {
    return null; // No source
  }

  try {
    const [source, created] = await Source.findOrCreate({
      where: { name: sourceName },
      defaults: {
        name: sourceName,
        is_active: true,
      },
    });

    if (created) {
      console.log(`✅ Created new source: ${sourceName}`);
    }

    return source.id;
  } catch (error) {
    console.error(
      `Error finding/creating source ${sourceName}:`,
      error.message
    );
    return null;
  }
}

/**
 * Save a single article to the database
 */
async function saveArticle(articleData) {
  try {
    // Check if article already exists by URL
    const existingArticle = await Article.findOne({
      where: { original_url: articleData.original_url },
    });

    if (existingArticle) {
      console.log(`⚠️ Article already exists: ${articleData.title}`);
      return existingArticle;
    }

    // Find or create source
    const sourceId = await findOrCreateSource(articleData.source);

    // Create new article
    const article = await Article.create({
      title: articleData.title,
      summary: articleData.summary,
      original_url: articleData.original_url,
      source_id: sourceId,
      published_at: articleData.published_at,
      content_text: articleData.content_text,
      language_code: articleData.language_code || "en-IN",
      image_url: articleData.image_url,
      actors: articleData.actors || [],
      place: articleData.place,
      topic: articleData.topic,
    });

    console.log(`✅ Saved article: ${article.title}`);
    return article;
  } catch (error) {
    // CHANGED: Re-throw error so saveArticles loop can handle it
    throw error;
  }
}

/**
 * Save multiple articles to the database
 */
async function saveArticles(articlesArray) {
  const savedArticles = [];
  const errors = [];

  for (const articleData of articlesArray) {
    try {
      const saved = await saveArticle(articleData);
      if (saved) {
        savedArticles.push(saved);
      }
    } catch (error) {
      // This block is now reachable because saveArticle throws
      errors.push({ article: articleData.title, error: error.message });
    }
  }

  console.log(`\n📊 Save Summary:`);
  console.log(`  ✅ Saved: ${savedArticles.length} articles`);
  console.log(`  ❌ Failed: ${errors.length} articles`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((err) => console.log(`  - ${err.article}: ${err.error}`));
  }

  return {
    saved: savedArticles,
    errors,
    count: savedArticles.length,
  };
}

/**
 * Get articles from database with filters
 */
async function getArticles(filters = {}) {
  try {
    const where = {};

    if (filters.topic) {
      where.topic = filters.topic;
    }

    if (filters.place) {
      where.place = filters.place;
    }

    if (filters.language_code) {
      where.language_code = filters.language_code;
    }

    const articles = await Article.findAll({
      where,
      include: [
        {
          model: Source,
          as: "source",
          attributes: ["name", "website_url"],
        },
      ],
      order: [["published_at", "DESC"]],
      limit: filters.limit || null,
    });

    return articles;
  } catch (error) {
    console.error("Error fetching articles from DB:", error.message);
    return [];
  }
}

/**
 * Get articles by topic/category
 */
async function getArticlesByTopic(topic, limit = null) {
  return getArticles({ topic, limit });
}

/**
 * Get articles by place/location
 */
async function getArticlesByPlace(place, limit = 20) {
  return getArticles({ place, limit });
}

/**
 * Search articles by keyword
 */
async function searchArticles(keyword, limit = 20) {
  try {
    const { Op } = require('sequelize');
    
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { summary: { [Op.iLike]: `%${keyword}%` } },
        ],
      },
      include: [
        {
          model: Source,
          as: "source",
        },
      ],
      order: [["published_at", "DESC"]],
      limit,
    });

    return articles;
  } catch (error) {
    console.error("Error searching articles:", error.message);
    return [];
  }
}

module.exports = {
  saveArticle,
  saveArticles,
  getArticles,
  getArticlesByTopic,
  getArticlesByPlace,
  searchArticles,
  findOrCreateSource,
};