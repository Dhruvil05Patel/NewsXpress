const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { sequelize } = require('../config/db');
const UserInteraction = require('../models/UserInteraction')(sequelize);
const UserInteractionService = require('../services/UserInteractionService');
const { findOrCreateProfileByAuthId } = require('../services/ProfileService');
const admin = require('../config/firebaseAdmin');

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
      activity_type = 'view',
      duration_seconds = 0,
      metadata
    } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Create interaction record using UserInteractionService
    const result = await UserInteractionService.trackInteraction(
      req.user.id,
      article_id,
      duration_seconds,
      metadata?.category_name || null
    );
    
    res.json({
      success: true,
      message: 'Activity tracked successfully',
      interaction_id: result.id
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
    const { days = 7 } = req.query;
    
    // Analytics endpoint - returns mock data
    // Full analytics would require RecommendationLog model
    res.json({
      success: true,
      data: {
        time_period_days: days,
        total_recommendations: 0,
        clicked_recommendations: 0,
        overall_ctr: 0,
        by_type: []
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
    const interactions = await UserInteraction.findAll({
      where: {
        profile_id: userId
      },
      attributes: ['article_id'],
      order: [['createdAt', 'DESC']],
      limit,
      raw: true
    });
    
    return interactions.map(a => a.article_id);
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
    // Recommendations logging would require RecommendationLog model
    // This is a stub implementation
    console.log(`Would log ${recommendations.length} recommendations of type ${type} for user ${userId}`);
  } catch (error) {
    console.error('Error logging recommendations:', error);
  }
}

/**
 * Get recommendations based on user's preferred categories (Smart Recommendations)
 * GET /api/recommendations/smart/category-based
 * 
 * Analysis:
 * 1. Analyzes user's reading behavior (time spent, interaction count)
 * 2. Identifies top categories
 * 3. Returns unread articles from preferred categories
 */
router.get('/smart/category-based', async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id || req.query.user_id;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get category-based recommendations
    const recommendations = await UserInteractionService.getRecommendationsByCategory(userId, limit);

    // Get user's top categories for analytics
    const topCategories = await UserInteractionService.getUserTopCategories(userId, 5);

    if (recommendations.length === 0) {
      return res.json({
        success: false,
        message: 'No recommendations available. Read more news to get personalized recommendations.',
        reason: 'insufficient_interaction_history',
        top_categories: topCategories,
        recommendations: []
      });
    }

    res.json({
      success: true,
      recommendations: recommendations,
      analysis: {
        top_categories: topCategories,
        total_interaction_count: topCategories.reduce((sum, cat) => sum + cat.article_count, 0),
        total_time_spent_seconds: topCategories.reduce((sum, cat) => sum + cat.total_time_seconds, 0),
        based_on: 'Category preference analysis'
      },
      meta: {
        count: recommendations.length,
        user_id: userId,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error in category-based recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

/**
 * Smart Recommendations - Returns only article IDs
 * GET /api/recommendations/smart?userId=...&limit=...
 * 
 * Returns: { ids: ["uuid1", "uuid2", ...] }
 */
router.get('/smart', async (req, res) => {
  try {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 200;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    // Get category-based recommendations
    const recommendations = await UserInteractionService.getRecommendationsByCategory(userId, limit);

    // Extract just the IDs
    const ids = recommendations.map(article => article.id);

    res.json({
      ids: ids,
      meta: {
        count: ids.length,
        user_id: userId,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error in smart recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get smart recommendations',
      message: error.message
    });
  }
});

/**
 * Get user's interaction statistics
 * GET /api/recommendations/smart/user-stats
 */
router.get('/smart/user-stats', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const topCategories = await UserInteractionService.getUserTopCategories(userId, 10);

    const stats = {
      user_id: userId,
      top_categories: topCategories,
      total_interactions: topCategories.reduce((sum, cat) => sum + cat.article_count, 0),
      total_time_seconds: topCategories.reduce((sum, cat) => sum + cat.total_time_seconds, 0),
      average_time_per_article: topCategories.length > 0 
        ? Math.round(topCategories.reduce((sum, cat) => sum + cat.total_time_seconds, 0) / topCategories.reduce((sum, cat) => sum + cat.article_count, 0))
        : 0
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      message: error.message
    });
  }
});

/**
 * Track user interaction with time spent on article
 * POST /api/recommendations/smart/track
 * 
 * Body: {
 *   user_id: string,
 *   article_id: string,
 *   time_spent_seconds: number,
 *   category_name: string
 * }
 * 
 * Time data is stored as JSON in the 'note' field:
 * { "time_spent_seconds": X, "visits": Y, "category": Z }
 */
router.post('/smart/track', async (req, res) => {
  try {
    const requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const startTs = Date.now();
    const { user_id, article_id, time_spent_seconds = 0, category_name } = req.body;

    console.log(`[smart.track][${requestId}] incoming body`, req.body);

    // Basic required field validation
    const errors = [];
    if (!user_id) errors.push('user_id is required');
    if (!article_id) errors.push('article_id is required');

    // UUID format checks (best-effort; skip if clearly not UUID to surface earlier)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (user_id && !uuidRegex.test(user_id)) errors.push('user_id not a valid UUID');
    if (article_id && !uuidRegex.test(article_id)) errors.push('article_id not a valid UUID');

    // time_spent_seconds sanity
    if (time_spent_seconds != null) {
      const num = Number(time_spent_seconds);
      if (Number.isNaN(num) || num < 0) errors.push('time_spent_seconds must be a non-negative number');
    }

    if (errors.length) {
      console.warn(`[smart.track][${requestId}] validation failed`, errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        errors
      });
    }

    let result;
    try {
      result = await UserInteractionService.trackInteraction(
        user_id,
        article_id,
        time_spent_seconds,
        category_name
      );
    } catch (svcError) {
      console.error(`[smart.track][${requestId}] service error`, { message: svcError.message, code: svcError.code, stack: svcError.stack });
      // Map known errors to appropriate status codes
      let status = 500;
      if (svcError.message?.startsWith('NOT_FOUND:')) status = 404;
      if (svcError.code === 'PROFILE_NOT_FOUND') status = 404;
      if (svcError.code === 'ARTICLE_NOT_FOUND') status = 404;
      return res.status(status).json({
        success: false,
        error: 'Failed to track interaction',
        reason: svcError.code || svcError.message,
        message: svcError.message,
        request_id: requestId
      });
    }

    if (!result) {
      console.error(`[smart.track][${requestId}] service returned null result`);
      return res.status(500).json({
        success: false,
        error: 'Failed to track interaction',
        reason: 'NULL_RESULT',
        request_id: requestId
      });
    }
    try {
      const summary = result?.toJSON ? result.toJSON() : result;
      console.log(`[smart.track][${requestId}] service result`, {
        hasToJSON: !!result?.toJSON,
        id: summary?.id,
        profile_id: summary?.profile_id,
        article_id: summary?.article_id,
      });
    } catch (_) {}

    // Parse the stored time data from note field
    let timeData = { time_spent_seconds: 0, visits: 0, category: null };
    try {
      timeData = result.note ? JSON.parse(result.note) : timeData;
    } catch (e) {
      console.warn(`[smart.track][${requestId}] note parse failed, using defaults`);
    }

    console.log(`[smart.track][${requestId}] success interaction_id=${result.id} time=${timeData.time_spent_seconds}s visits=${timeData.visits} category=${timeData.category} duration_ms=${Date.now()-startTs}`);

    res.json({
      success: true,
      message: 'Interaction tracked successfully',
      interaction: {
        user_id: result.profile_id,
        article_id: result.article_id,
        ...timeData
      },
      request_id: requestId
    });

  } catch (error) {
    console.error('[smart.track] unexpected route error', { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to track interaction',
      message: error.message,
      request_id: crypto.randomUUID ? crypto.randomUUID() : 'route-catch'
    });
  }
});

/**
 * Track interaction by Firebase token (auto-resolve Profile)
 * POST /api/recommendations/smart/track-by-auth
 * Body: { idToken: string, article_id: uuid, time_spent_seconds?: number, category_name?: string }
 */
router.post('/smart/track-by-auth', async (req, res) => {
  const requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const startTs = Date.now();
  try {
    const { idToken, article_id, time_spent_seconds = 0, category_name } = req.body || {};
    console.log(`[smart.trackByAuth][${requestId}] incoming body`, { hasIdToken: !!idToken, article_id, time_spent_seconds, category_name });

    // Validate basic fields
    const errors = [];
    if (!idToken) errors.push('idToken is required');
    if (!article_id) errors.push('article_id is required');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (article_id && !uuidRegex.test(article_id)) errors.push('article_id not a valid UUID');
    const t = Number(time_spent_seconds);
    if (Number.isNaN(t) || t < 0) errors.push('time_spent_seconds must be a non-negative number');
    if (errors.length) {
      console.warn(`[smart.trackByAuth][${requestId}] validation failed`, errors);
      return res.status(400).json({ success: false, error: 'Invalid request body', errors, request_id: requestId });
    }

    // Verify Firebase token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.error(`[smart.trackByAuth][${requestId}] token verify failed`, { message: e.message });
      return res.status(401).json({ success: false, error: 'Invalid or expired idToken', request_id: requestId });
    }

    // Resolve or create profile
    const profile = await findOrCreateProfileByAuthId(decoded.uid, {
      full_name: decoded.name || null,
      avatar_url: decoded.picture || null,
      username: decoded.name ? decoded.name.replace(/\s+/g, '') : (decoded.email ? decoded.email.split('@')[0] : null),
      email: decoded.email || null,
    });

    // Track interaction
    let result;
    try {
      result = await UserInteractionService.trackInteraction(
        profile.id,
        article_id,
        t,
        category_name
      );
    } catch (svcError) {
      console.error(`[smart.trackByAuth][${requestId}] service error`, { message: svcError.message, code: svcError.code });
      let status = 500;
      if (svcError.code === 'ARTICLE_NOT_FOUND') status = 404;
      return res.status(status).json({
        success: false,
        error: 'Failed to track interaction',
        reason: svcError.code || svcError.message,
        request_id: requestId,
      });
    }

    let timeData = { time_spent_seconds: 0, visits: 0, category: null };
    try {
      timeData = result.note ? JSON.parse(result.note) : timeData;
    } catch (_) {}

    console.log(`[smart.trackByAuth][${requestId}] success interaction_id=${result.id} profile=${profile.id} article=${article_id} duration_ms=${Date.now()-startTs}`);

    return res.json({
      success: true,
      message: 'Interaction tracked successfully',
      interaction: {
        user_id: result.profile_id,
        article_id: result.article_id,
        ...timeData,
      },
      request_id: requestId,
    });
  } catch (error) {
    console.error('[smart.trackByAuth] unexpected error', { message: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: 'Failed to track interaction', message: error.message });
  }
});

module.exports = router;
