/**
 * User Interaction Service
 * Handles all database operations for user interactions,
 * including time tracking, bookmarking, and recommendation logic.
 * Uses existing database columns only - stores time data in note field.
 */

const { UserInteraction, Article, Profile } = require('../config/db');
const { Op } = require('sequelize');

async function trackInteraction(profileId, articleId, timeSpentSeconds = 0, categoryName = null) {
  try {
    // Existence checks to provide clearer error responses
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      const err = new Error('NOT_FOUND: Profile');
      err.code = 'PROFILE_NOT_FOUND';
      throw err;
    }
    const article = await Article.findByPk(articleId);
    if (!article) {
      const err = new Error('NOT_FOUND: Article');
      err.code = 'ARTICLE_NOT_FOUND';
      throw err;
    }
    console.log(`trackInteraction resolved entities profile=${profileId} article=${articleId}`);
    const roundedTime = Math.round(timeSpentSeconds || 0);

    // Check if interaction exists
    let interaction = await UserInteraction.findOne({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
    });

    let data = {
      time_spent_seconds: roundedTime,
      visits: 1,
      category: categoryName,
    };

    if (interaction) {
      // Parse existing time data from note
      let existingData = {};
      try {
        existingData = interaction.note ? JSON.parse(interaction.note) : {};
      } catch (e) {
        existingData = {};
      }

      // Accumulate time and increment visits
      data = {
        time_spent_seconds: (existingData.time_spent_seconds || 0) + roundedTime,
        visits: (existingData.visits || 1) + 1,
        category: categoryName || existingData.category,
      };

      interaction.note = JSON.stringify(data);
      interaction.interaction_at = new Date();
      await interaction.save();
      console.log(`✅ Interaction updated: ${articleId} (Total: ${data.time_spent_seconds}s, Visits: ${data.visits})`);
    } else {
      // Create new interaction row
      interaction = await UserInteraction.create({
        profile_id: profileId,
        article_id: articleId,
        interaction_at: new Date(),
        note: JSON.stringify(data),
      });
      console.log(`✅ Interaction created: ${articleId} (Time: ${data.time_spent_seconds}s, Visits: ${data.visits})`);
    }

    return interaction;

  } catch (error) {
    console.error('Error in trackInteraction:', { message: error.message, code: error.code, stack: error.stack });
    // Re-throw preserving original message/code for route handling
    throw error;
  }
}

async function addBookmark(profileId, articleId, note = null) {
  try {
    // Check if an interaction for this pair already exists
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
      defaults: {
        // These are set if a new row is created
        profile_id: profileId,
        article_id: articleId,
        bookmark_timestamp: new Date(), // Set the bookmark time
        note: note,
        interaction_at: new Date(), // Set the first interaction time
      },
    });

    if (!created) {
      // The interaction row already existed, so just update it
      interaction.bookmark_timestamp = new Date();
      if (note) {
        interaction.note = note;
      }
      await interaction.save();
      console.log(`✅ Bookmark updated for article: ${articleId}`);
    } else {
      console.log(`✅ Bookmark created for article: ${articleId}`);
    }

    return interaction;

  } catch (error) {
    console.error('Error in addBookmark:', error.message);
    throw new Error('Could not add bookmark.');
  }
}

async function removeBookmark(profileId, articleId) {
  try {
    // Find the specific interaction
    const interaction = await UserInteraction.findOne({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
    });

    if (interaction) {
      // "Remove" the bookmark by nullifying its fields
      interaction.bookmark_timestamp = null;
      interaction.note = null;
      await interaction.save();
      
      console.log(`✅ Bookmark removed for article: ${articleId}`);
      return interaction;
    }

    console.log(`⚠️ No bookmark found to remove for article: ${articleId}`);
    return null; // No bookmark was found to remove

  } catch (error) {
    console.error('Error in removeBookmark:', error.message);
    throw new Error('Could not remove bookmark.');
  }
}

async function getBookmarksByProfile(profileId) {
  try {
    const bookmarks = await UserInteraction.findAll({
      where: {
        profile_id: profileId,
        // Find all interactions where bookmark_timestamp is not null
        bookmark_timestamp: {
          [Op.not]: null,
        },
      },
      // Include the associated Article data for each bookmark
      include: [
        {
          model: Article,
          as: 'article',
        },
      ],
      order: [['bookmark_timestamp', 'DESC']],
    });

    return bookmarks;

  } catch (error) {
    console.error('Error in getBookmarksByProfile:', error.message);
    throw new Error('Could not retrieve bookmarks.');
  }
}

/**
 * Parse time data from note field (JSON format)
 */
function parseTimeData(noteJson) {
  try {
    return noteJson ? JSON.parse(noteJson) : { time_spent_seconds: 0, visits: 0, category: null };
  } catch (e) {
    return { time_spent_seconds: 0, visits: 0, category: null };
  }
}

async function getUserTopCategories(profileId, limit = 5) {
  try {
    const interactions = await UserInteraction.findAll({
      where: { profile_id: profileId },
      attributes: ['note'],
      raw: true,
    });

    // Aggregate time by category from note field
    const categoryMap = {};
    interactions.forEach(interaction => {
      const data = parseTimeData(interaction.note);
      if (data.category) {
        if (!categoryMap[data.category]) {
          categoryMap[data.category] = { total_time_seconds: 0, article_count: 0 };
        }
        categoryMap[data.category].total_time_seconds += data.time_spent_seconds || 0;
        categoryMap[data.category].article_count += 1;
      }
    });

    // Convert to array, sort by time, and limit
    const topCategories = Object.entries(categoryMap)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total_time_seconds - a.total_time_seconds)
      .slice(0, limit);

    return topCategories;

  } catch (error) {
    console.error('Error in getUserTopCategories:', error.message);
    throw new Error('Could not retrieve user categories.');
  }
}

async function getRecommendationsByCategory(profileId, limit = 10) {
  try {
    // Get user's top categories (increased to 10 for more diverse recommendations)
    const topCategories = await getUserTopCategories(profileId, 10);

    if (topCategories.length === 0) {
      console.log(`⚠️ No interaction history for user: ${profileId}`);
      return [];
    }

    const categoryNames = topCategories.map(cat => cat.category);

    // Get articles from top categories that user hasn't interacted with
    const userInteractionIds = new Set(
      (await UserInteraction.findAll({
        where: { profile_id: profileId },
        attributes: ['article_id'],
        raw: true,
      })).map(i => i.article_id)
    );

    // Fetch more articles to ensure we have enough after filtering
    const recommendedArticles = await Article.findAll({
      where: {
        topic: {
          [Op.in]: categoryNames,
        },
      },
      attributes: [
        'id', 'title', 'summary', 'image_url', 'topic', 'published_at', 'original_url',
      ],
      order: [['published_at', 'DESC']],
      limit: Math.min(limit * 3, 600), // Fetch up to 3x requested or max 600
    });

    // Filter out already-read articles
    const unreadArticles = recommendedArticles
      .filter(article => !userInteractionIds.has(article.id))
      .slice(0, limit)
      .map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        image_url: article.image_url,
        topic: article.topic,
        category: article.topic,
        published_at: article.published_at,
        url: article.original_url,
      }));

    return unreadArticles;

  } catch (error) {
    console.error('Error in getRecommendationsByCategory:', error.message);
    throw new Error('Could not get category-based recommendations.');
  }
}

module.exports = {
  trackInteraction,
  addBookmark,
  removeBookmark,
  getBookmarksByProfile,
  getUserTopCategories,
  getRecommendationsByCategory,
};