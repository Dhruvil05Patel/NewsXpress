/**
 * User Interaction Service
 * Handles all database operations for user interactions,
 * including time tracking, bookmarking, and recommendation logic.
 * Uses existing database columns only - stores time data in note field.
 */

const { UserInteraction, Article, Profile } = require('../config/db');
const { Op } = require('sequelize');

async function trackInteraction(profileId, articleId, timeSpentSeconds = 0, categoryName = null) {
  console.warn('⚠️ trackInteraction is deprecated. Use UserActivityService.trackActivity() instead.');
  
  try {
    // Simply create/update interaction timestamp without storing time data
    const [interaction] = await UserInteraction.findOrCreate({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
      defaults: {
        profile_id: profileId,
        article_id: articleId,
        interaction_at: new Date(),
      },
    });

    interaction.interaction_at = new Date();
    await interaction.save();
    
    return interaction;
  } catch (error) {
    console.error('Error in trackInteraction:', error.message);
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
        profile_id: profileId,
        article_id: articleId,
        bookmark_timestamp: new Date(),
        note: note || null, // User's personal note for this bookmark
        interaction_at: new Date(),
      },
    });

    if (!created) {
      // Update existing interaction
      interaction.bookmark_timestamp = new Date();
      // Update note if provided, otherwise keep existing
      if (note !== undefined) {
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
    const interaction = await UserInteraction.findOne({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
    });

    if (interaction) {
      // Only nullify bookmark timestamp, keep note in case user wants it back
      interaction.bookmark_timestamp = null;
      await interaction.save();
      
      console.log(`✅ Bookmark removed for article: ${articleId}`);
      return interaction;
    }

    console.log(`⚠️ No bookmark found to remove for article: ${articleId}`);
    return null;

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
 * Get user's top categories - now uses UserActivity table
 * @deprecated Use UserActivityService.getUserTopCategories() instead
 */
async function getUserTopCategories(profileId, limit = 5) {
  try {
    // Import UserActivityService to avoid circular dependency
    const UserActivityService = require('./UserActivityService');
    return await UserActivityService.getUserTopCategories(profileId, limit);
  } catch (error) {
    console.error('Error in getUserTopCategories:', error.message);
    // Fallback to bookmarked categories if no activity data
    const bookmarks = await getBookmarksByProfile(profileId);
    const categoryMap = {};
    
    bookmarks.forEach(bookmark => {
      const category = bookmark.article?.topic || 'Unknown';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    
    return Object.entries(categoryMap)
      .map(([category, count]) => ({ category, article_count: count, total_time_seconds: 0 }))
      .sort((a, b) => b.article_count - a.article_count)
      .slice(0, limit);
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