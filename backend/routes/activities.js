const express = require('express');
const router = express.Router();
const { verifyIdTokenMiddleware } = require('../middleware/auth');
const UserActivityService = require('../services/UserActivityService');

/**
 * Track user activity (for ML algorithm)
 * POST /api/activities/track
 * Body: { userId, articleId, activityType, durationSeconds, scrollPercentage, source, recommendationType, metadata }
 */
router.post('/api/activities/track', verifyIdTokenMiddleware, async (req, res) => {
  try {
    const {
      userId,
      articleId,
      activityType = 'view',
      durationSeconds = 0,
      scrollPercentage = null,
      source = 'app',
      recommendationType = null,
      metadata = null,
    } = req.body;

    if (!userId || !articleId) {
      return res.status(400).json({
        error: 'Missing required fields: userId and articleId',
      });
    }

    const activity = await UserActivityService.trackActivity(userId, articleId, {
      activityType,
      durationSeconds,
      scrollPercentage,
      source,
      recommendationType,
      metadata,
    });

    res.json({
      success: true,
      activity: {
        id: activity.id,
        user_id: activity.user_id,
        article_id: activity.article_id,
        activity_type: activity.activity_type,
        duration_seconds: activity.duration_seconds,
        scroll_percentage: activity.scroll_percentage,
      },
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    
    if (error.code === 'PROFILE_NOT_FOUND' || error.code === 'ARTICLE_NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Could not track activity' });
  }
});

/**
 * Get user reading statistics
 * GET /api/activities/stats/:userId?days=30
 */
router.get('/api/activities/stats/:userId', verifyIdTokenMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const stats = await UserActivityService.getUserReadingStats(userId, days);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Could not retrieve statistics' });
  }
});

/**
 * Get user's top categories
 * GET /api/activities/top-categories/:userId?limit=5
 */
router.get('/api/activities/top-categories/:userId', verifyIdTokenMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const categories = await UserActivityService.getUserTopCategories(userId, limit);

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching top categories:', error);
    res.status(500).json({ error: 'Could not retrieve top categories' });
  }
});

/**
 * Get activities for ML training
 * GET /api/activities/ml-data?userId=xxx&limit=10000
 */
router.get('/api/activities/ml-data', verifyIdTokenMiddleware, async (req, res) => {
  try {
    const { userId, limit } = req.query;
    const limitNum = parseInt(limit) || 10000;

    const activities = await UserActivityService.getActivitiesForML(
      userId || null,
      limitNum
    );

    res.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('Error fetching ML data:', error);
    res.status(500).json({ error: 'Could not retrieve activity data' });
  }
});

module.exports = router;
