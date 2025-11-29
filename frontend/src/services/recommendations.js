// Frontend Service for ML Recommendations
// Wraps api.js ML API helpers for clean interface

import { getRecommendations as apiGetRecommendations, trackInteraction as apiTrackInteraction } from './api';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000";

// Utility for safe JSON fetch
async function safeJson(resp) {
  if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
  return resp.json();
}

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

  /**
   * SMART RECOMMENDATIONS: Returns only article IDs
   * GET /api/recommendations/smart?userId=...&limit=...
   */
  async fetchSmartRecommendations({ userId, limit = 200 }) {
    const res = await fetch(
      `${API_BASE}/api/recommendations/smart?userId=${userId}&limit=${limit}`
    );
    return safeJson(res); // → { ids: ["101","102",...] }
  }

  /**
   * BULK ARTICLE FETCH
   * POST /api/articles/bulk
   * Body: { ids: [...] }
   */
  async fetchArticlesBulk(ids) {
    const res = await fetch(`${API_BASE}/api/articles/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return safeJson(res); // → [ { id, title, image, ... }, ... ]
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

  /**
   * CLICK TRACKING
   * POST /api/recommendations/track
   */
  async trackClick(articleId, userId = null, source = 'feed', method = 'hybrid') {
    if (!userId) {
      // Fallback to activity tracking if no userId
      return this.trackActivity({
        userId,
        articleId,
        activityType: 'click',
        source,
        recommendationType: method
      });
    }

    try {
      await fetch(`${API_BASE}/api/recommendations/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          userId,
          source,
          method,
          timestamp: Date.now(),
        }),
      });
    } catch (e) {
      console.warn("Failed to track click", e);
    }
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
