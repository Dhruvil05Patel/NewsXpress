const express = require('express');
const router = express.Router();
const axios = require('axios');
const { sequelize } = require('../config/db');
const UserActivity = require('../models/UserActivity')(sequelize);
const RecommendationLog = require('../models/RecommendationLog')(sequelize);

// ML API base URL
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

/**
 * Get similar articles based on content
 * GET /api/recommendations/similar/:articleId
 */
router.get('/similar/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { top_n = 10, exclude } = req.query;
    
    // Call Python ML API
    const response = await axios.get(
      `${ML_API_URL}/api/recommendations/similar/${articleId}`,
      {
        params: { top_n, exclude },
        timeout: 5000
      }
    );
    
    const recommendations = response.data.recommendations || [];
    
    // Log recommendations for analytics
    if (req.user && req.user.id) {
      await logRecommendations(
        req.user.id,
        recommendations,
        'content-based',
        { source_article_id: articleId }
      );
    }
    
    res.json({
      success: true,
      data: recommendations,
      meta: {
        count: recommendations.length,
        source_article_id: articleId,
        from_cache: response.data.from_cache
      }
    });
    
  } catch (error) {
    console.error('Error fetching similar articles:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations',
      message: error.message
    });
  }
});

/**
 * Get personalized recommendations for user
 * POST /api/recommendations/personalized
 */
router.post('/personalized', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const userId = req.user.id;
    const { top_n = 10, method = 'hybrid', exclude = [] } = req.body;
    
    // Get user's recent articles
    const recentArticles = await getUserRecentArticles(userId, 5);
    
    // Call Python ML API
    const response = await axios.post(
      `${ML_API_URL}/api/recommendations/personalized/${userId}`,
      {
        recent_articles: recentArticles,
        exclude
      },
      {
        params: { top_n, method },
        timeout: 5000
      }
    );
    
    const recommendations = response.data.recommendations || [];
    
    // Log recommendations
    await logRecommendations(
      userId,
      recommendations,
      method,
      { recent_articles: recentArticles }
    );
    
    res.json({
      success: true,
      data: recommendations,
      meta: {
        count: recommendations.length,
        method,
        from_cache: response.data.from_cache
      }
    });
    
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized recommendations',
      message: error.message
    });
  }
});

/**
 * Get trending articles
 * GET /api/recommendations/trending
 */
router.get('/trending', async (req, res) => {
  try {
    const { top_n = 10, days = 7 } = req.query;
    
    // Call Python ML API
    const response = await axios.get(
      `${ML_API_URL}/api/recommendations/trending`,
      {
        params: { top_n, days },
        timeout: 5000
      }
    );
    
    const recommendations = response.data.recommendations || [];
    
    res.json({
      success: true,
      data: recommendations,
      meta: {
        count: recommendations.length,
        time_window_days: days,
        from_cache: response.data.from_cache
      }
    });
    
  } catch (error) {
    console.error('Error fetching trending articles:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending articles',
      message: error.message
    });
  }
});

/**
 * Track user activity (view, read, like, etc.)
 * POST /api/recommendations/track
 */
router.post('/track', async (req, res) => {
  try {
    const {
      article_id,
      activity_type,
      duration_seconds,
      scroll_percentage,
      source,
      recommendation_type,
      metadata
    } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Create activity record
    await UserActivity.create({
      user_id: req.user.id,
      article_id,
      activity_type,
      duration_seconds,
      scroll_percentage,
      source,
      recommendation_type,
      metadata
    });
    
    // If this was a click on a recommendation, update the log
    if (source === 'recommendation' && recommendation_type) {
      await RecommendationLog.update(
        {
          was_clicked: true,
          clicked_at: new Date()
        },
        {
          where: {
            user_id: req.user.id,
            article_id,
            recommendation_type,
            was_clicked: false
          },
          order: [['created_at', 'DESC']],
          limit: 1
        }
      );
    }
    
    res.json({
      success: true,
      message: 'Activity tracked successfully'
    });
    
  } catch (error) {
    console.error('Error tracking activity:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to track activity',
      message: error.message
    });
  }
});

/**
 * Get recommendation analytics
 * GET /api/recommendations/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { days = 7, recommendation_type } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    // Build where clause
    const whereClause = {
      created_at: {
        [sequelize.Sequelize.Op.gte]: cutoffDate
      }
    };
    
    if (recommendation_type) {
      whereClause.recommendation_type = recommendation_type;
    }
    
    // Get recommendation statistics
    const totalRecommendations = await RecommendationLog.count({
      where: whereClause
    });
    
    const clickedRecommendations = await RecommendationLog.count({
      where: {
        ...whereClause,
        was_clicked: true
      }
    });
    
    const ctr = totalRecommendations > 0
      ? (clickedRecommendations / totalRecommendations) * 100
      : 0;
    
    // Get CTR by recommendation type
    const ctrByType = await RecommendationLog.findAll({
      attributes: [
        'recommendation_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.cast(sequelize.col('was_clicked'), 'integer')), 'clicked']
      ],
      where: whereClause,
      group: ['recommendation_type'],
      raw: true
    });
    
    const typeStats = ctrByType.map(stat => ({
      type: stat.recommendation_type,
      total: parseInt(stat.total),
      clicked: parseInt(stat.clicked || 0),
      ctr: (parseInt(stat.clicked || 0) / parseInt(stat.total)) * 100
    }));
    
    res.json({
      success: true,
      data: {
        time_period_days: days,
        total_recommendations: totalRecommendations,
        clicked_recommendations: clickedRecommendations,
        overall_ctr: ctr.toFixed(2),
        by_type: typeStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

/**
 * Clear recommendation cache
 * POST /api/recommendations/cache/clear
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const { user_id, article_id } = req.body;
    
    await axios.post(
      `${ML_API_URL}/api/cache/clear`,
      { user_id, article_id },
      { timeout: 5000 }
    );
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
    
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * Helper: Get user's recent article IDs
 */
async function getUserRecentArticles(userId, limit = 5) {
  try {
    const activities = await UserActivity.findAll({
      where: {
        user_id: userId,
        activity_type: ['read', 'view', 'like']
      },
      attributes: ['article_id'],
      order: [['created_at', 'DESC']],
      limit,
      raw: true
    });
    
    return activities.map(a => a.article_id);
  } catch (error) {
    console.error('Error getting recent articles:', error);
    return [];
  }
}

/**
 * Helper: Log recommendations for analytics
 */
async function logRecommendations(userId, recommendations, type, context = {}) {
  try {
    const logs = recommendations.map((rec, index) => ({
      user_id: userId,
      article_id: rec.id,
      recommendation_type: type,
      score: rec.similarity_score || rec.relevance_score || rec.hybrid_score || null,
      position: index + 1,
      was_clicked: false,
      context
    }));
    
    await RecommendationLog.bulkCreate(logs);
  } catch (error) {
    console.error('Error logging recommendations:', error);
  }
}

module.exports = router;
