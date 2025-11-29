/**
 * User Activity Service
 * Handles ML-related activity tracking in user_activities table
 * Separate from bookmarks which use user_interactions table
 */

const { UserActivity, Article, Profile } = require('../config/db');
const { Op } = require('sequelize');

/**
 * Track user activity for ML algorithm
 * @param {string} userId - Profile ID
 * @param {string} articleId - Article ID
 * @param {object} activityData - Activity details
 * @returns {Promise<UserActivity>}
 */
async function trackActivity(userId, articleId, activityData = {}) {
  try {
    const {
      activityType = 'view',
      durationSeconds = 0,
      scrollPercentage = null,
      source = 'app',
      recommendationType = null,
      metadata = null,
    } = activityData;

    // Validate entities exist
    const profile = await Profile.findByPk(userId);
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

    // Check if recent activity exists (within last 5 minutes)
    const recentActivity = await UserActivity.findOne({
      where: {
        user_id: userId,
        article_id: articleId,
        activity_type: activityType,
        created_at: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      order: [['created_at', 'DESC']],
    });

    if (recentActivity) {
      // Update existing activity (accumulate duration)
      const inc = Math.max(0, Math.round(Number(durationSeconds) || 0));
      recentActivity.duration_seconds = Math.max(0, (recentActivity.duration_seconds || 0)) + inc;
      if (scrollPercentage !== null && scrollPercentage > (recentActivity.scroll_percentage || 0)) {
        recentActivity.scroll_percentage = scrollPercentage;
      }
      if (metadata) {
        recentActivity.metadata = { ...recentActivity.metadata, ...metadata };
      }
      await recentActivity.save();
      
      console.log(`✅ Activity updated: user=${userId} article=${articleId} type=${activityType} (+${inc}s => ${recentActivity.duration_seconds}s, scroll=${recentActivity.scroll_percentage}%)`);
      return recentActivity;
    }

    // Create new activity record
    const activity = await UserActivity.create({
      user_id: userId,
      article_id: articleId,
      activity_type: activityType,
      duration_seconds: Math.round(durationSeconds),
      scroll_percentage: scrollPercentage,
      source,
      recommendation_type: recommendationType,
      metadata,
    });

    console.log(`✅ Activity created: user=${userId} article=${articleId} type=${activityType} (+${Math.round(durationSeconds)}s)`);
    return activity;

  } catch (error) {
    console.error('Error in trackActivity:', { message: error.message, code: error.code });
    throw error;
  }
}

/**
 * Get user's reading statistics
 * @param {string} userId - Profile ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<object>}
 */
async function getUserReadingStats(userId, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activities = await UserActivity.findAll({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: startDate },
      },
      include: [
        {
          model: Article,
          as: 'article',
          attributes: ['topic', 'place', 'actors'],
        },
      ],
    });

    // Calculate stats
    const totalArticles = new Set(activities.map(a => a.article_id)).size;
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    const avgDuration = totalArticles > 0 ? totalDuration / totalArticles : 0;

    // Category breakdown
    const categoryStats = {};
    activities.forEach(activity => {
      const category = activity.article?.topic || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalDuration: 0,
          articles: new Set(),
        };
      }
      categoryStats[category].articles.add(activity.article_id);
      categoryStats[category].count++;
      categoryStats[category].totalDuration += activity.duration_seconds || 0;
    });

    // Convert to array and sort
    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        article_count: stats.articles.size,
        total_duration: stats.totalDuration,
        avg_duration: stats.totalDuration / stats.articles.size,
      }))
      .sort((a, b) => b.total_duration - a.total_duration);

    return {
      total_articles: totalArticles,
      total_duration_seconds: totalDuration,
      avg_duration_seconds: Math.round(avgDuration),
      top_categories: topCategories,
      period_days: days,
    };

  } catch (error) {
    console.error('Error in getUserReadingStats:', error.message);
    throw new Error('Could not retrieve reading statistics.');
  }
}

/**
 * Get user activities for ML training
 * @param {string} userId - Profile ID (optional)
 * @param {number} limit - Maximum records to return
 * @returns {Promise<Array>}
 */
async function getActivitiesForML(userId = null, limit = 10000) {
  try {
    const where = {};
    if (userId) {
      where.user_id = userId;
    }

    const activities = await UserActivity.findAll({
      where,
      include: [
        {
          model: Article,
          as: 'article',
          attributes: ['id', 'topic', 'place', 'actors', 'published_at'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
    });

    return activities.map(a => ({
      user_id: a.user_id,
      article_id: a.article_id,
      activity_type: a.activity_type,
      duration_seconds: a.duration_seconds || 0,
      scroll_percentage: a.scroll_percentage || 0,
      category: a.article?.topic,
      place: a.article?.place,
      actors: a.article?.actors,
      created_at: a.created_at,
    }));

  } catch (error) {
    console.error('Error in getActivitiesForML:', error.message);
    throw new Error('Could not retrieve activities for ML.');
  }
}

/**
 * Get user's top categories based on engagement
 * @param {string} userId - Profile ID
 * @param {number} limit - Number of categories to return
 * @returns {Promise<Array>}
 */
async function getUserTopCategories(userId, limit = 5) {
  try {
    const stats = await getUserReadingStats(userId, 30);
    return stats.top_categories.slice(0, limit);
  } catch (error) {
    console.error('Error in getUserTopCategories:', error.message);
    throw new Error('Could not retrieve user categories.');
  }
}

module.exports = {
  trackActivity,
  getUserReadingStats,
  getActivitiesForML,
  getUserTopCategories,
};
