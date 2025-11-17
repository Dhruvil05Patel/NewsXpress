// Frontend Service for Recommendations

import api from './api';

/**
 * Recommendation Service
 * Handles all recommendation-related API calls
 */
class RecommendationService {
  
  /**
   * Get articles similar to the current article
   * @param {string} articleId - ID of the current article
   * @param {number} topN - Number of recommendations
   * @param {string[]} excludeIds - Article IDs to exclude
   */
  async getSimilarArticles(articleId, topN = 5, excludeIds = []) {
    try {
      const response = await api.get(`/recommendations/similar/${articleId}`, {
        params: {
          top_n: topN,
          exclude: excludeIds
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching similar articles:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get personalized recommendations for the user
   * @param {number} topN - Number of recommendations
   * @param {string} method - 'hybrid' or 'collaborative'
   * @param {string[]} excludeIds - Article IDs to exclude
   */
  async getPersonalizedRecommendations(topN = 10, method = 'hybrid', excludeIds = []) {
    try {
      const response = await api.post('/recommendations/personalized', {
        top_n: topN,
        method,
        exclude: excludeIds
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get trending articles
   * @param {number} topN - Number of articles
   * @param {number} days - Time window in days
   */
  async getTrendingArticles(topN = 10, days = 7) {
    try {
      const response = await api.get('/recommendations/trending', {
        params: {
          top_n: topN,
          days
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Track user activity on an article
   * @param {Object} activityData - Activity details
   */
  async trackActivity(activityData) {
    try {
      const {
        articleId,
        activityType, // 'view', 'read', 'like', 'bookmark', 'share', 'click'
        durationSeconds = null,
        scrollPercentage = null,
        source = 'direct',
        recommendationType = null,
        metadata = {}
      } = activityData;

      await api.post('/recommendations/track', {
        article_id: articleId,
        activity_type: activityType,
        duration_seconds: durationSeconds,
        scroll_percentage: scrollPercentage,
        source,
        recommendation_type: recommendationType,
        metadata
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * Get recommendation analytics (admin only)
   * @param {number} days - Time period
   * @param {string} recommendationType - Filter by type
   */
  async getAnalytics(days = 7, recommendationType = null) {
    try {
      const response = await api.get('/recommendations/analytics', {
        params: {
          days,
          recommendation_type: recommendationType
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { success: false, data: null };
    }
  }
}

export default new RecommendationService();
