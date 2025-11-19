// Frontend Service for ML Recommendations
// Wraps api.js ML API helpers for clean interface

import { getRecommendations as apiGetRecommendations, trackInteraction as apiTrackInteraction } from './api';

/**
 * Recommendation Service
 * Clean wrapper around ML API endpoints
 */
class RecommendationService {
  
  async getSimilarArticles(articleId, topN = 5, excludeIds = []) {
    return apiGetRecommendations({
      method: 'content',
      articleId,
      topN,
      exclude: excludeIds
    });
  }

  async getPersonalizedRecommendations(userId, topN = 10, method = 'hybrid', excludeIds = []) {
    return apiGetRecommendations({
      method,
      userId,
      topN,
      exclude: excludeIds
    });
  }

  async getTrendingArticles(topN = 10, days = 7) {
    return apiGetRecommendations({
      method: 'trending',
      topN,
      days
    });
  }

  async trackActivity(activityData) {
    const {
      userId = null,
      articleId,
      activityType,
      source = 'direct',
      recommendationType = null,
      durationSeconds = null,
      scrollPercentage = null,
      metadata = {}
    } = activityData;

    return apiTrackInteraction({
      userId,
      articleId,
      activityType,
      source,
      recommendationType,
      durationSeconds,
      scrollPercentage,
      metadata
    });
  }

  async trackClick(articleId, userId = null, source = 'direct', recommendationType = null) {
    return this.trackActivity({
      userId,
      articleId,
      activityType: 'click',
      source,
      recommendationType
    });
  }

  async trackView(articleId, userId = null) {
    return this.trackActivity({
      userId,
      articleId,
      activityType: 'view',
      source: 'direct'
    });
  }

  async trackRead(articleId, userId = null, durationSeconds = 0, scrollPercentage = 0) {
    return this.trackActivity({
      userId,
      articleId,
      activityType: 'read',
      durationSeconds,
      scrollPercentage,
      source: 'direct'
    });
  }
}

export default new RecommendationService();
