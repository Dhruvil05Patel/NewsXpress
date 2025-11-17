// React Hook for Recommendations

import { useState, useEffect } from 'react';
import recommendationService from '../services/recommendations';

/**
 * Hook to fetch similar articles
 * @param {string} articleId - Current article ID
 * @param {number} topN - Number of recommendations
 */
export const useSimilarArticles = (articleId, topN = 5) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!articleId) return;

    const fetchSimilar = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await recommendationService.getSimilarArticles(articleId, topN);
        if (result.success) {
          setRecommendations(result.data);
        } else {
          setError('Failed to load recommendations');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [articleId, topN]);

  return { recommendations, loading, error };
};

/**
 * Hook to fetch personalized recommendations
 * @param {number} topN - Number of recommendations
 * @param {string} method - 'hybrid' or 'collaborative'
 */
export const usePersonalizedRecommendations = (topN = 10, method = 'hybrid') => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await recommendationService.getPersonalizedRecommendations(topN, method);
      if (result.success) {
        setRecommendations(result.data);
      } else {
        setError('Failed to load personalized recommendations');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [topN, method]);

  return { recommendations, loading, error, refetch: fetchRecommendations };
};

/**
 * Hook to fetch trending articles
 * @param {number} topN - Number of articles
 * @param {number} days - Time window
 */
export const useTrendingArticles = (topN = 10, days = 7) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await recommendationService.getTrendingArticles(topN, days);
        if (result.success) {
          setArticles(result.data);
        } else {
          setError('Failed to load trending articles');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [topN, days]);

  return { articles, loading, error };
};

/**
 * Hook to track article reading activity
 */
export const useArticleTracking = () => {
  const [startTime, setStartTime] = useState(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Start tracking when component mounts
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Track scroll percentage
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollPercentage(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track view/read activity
  const trackView = async (articleId, source = 'direct', recommendationType = null) => {
    await recommendationService.trackActivity({
      articleId,
      activityType: 'view',
      source,
      recommendationType
    });
  };

  const trackRead = async (articleId, source = 'direct', recommendationType = null) => {
    const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
    
    await recommendationService.trackActivity({
      articleId,
      activityType: 'read',
      durationSeconds,
      scrollPercentage,
      source,
      recommendationType
    });
  };

  const trackClick = async (articleId, source = 'recommendation', recommendationType = null) => {
    await recommendationService.trackActivity({
      articleId,
      activityType: 'click',
      source,
      recommendationType
    });
  };

  const trackLike = async (articleId) => {
    await recommendationService.trackActivity({
      articleId,
      activityType: 'like'
    });
  };

  const trackBookmark = async (articleId) => {
    await recommendationService.trackActivity({
      articleId,
      activityType: 'bookmark'
    });
  };

  return {
    trackView,
    trackRead,
    trackClick,
    trackLike,
    trackBookmark,
    scrollPercentage,
    durationSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  };
};
