import { useEffect, useRef, useCallback, useState } from 'react';
import api from '../services/api';

export const useInteractionTimer = (userId, articleId, categoryName, isActive) => {
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const wasActiveRef = useRef(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeSpent(0);
    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setTimeSpent(elapsed);
      }
    }, 1000);
  }, []);

  const stopTimerAndSend = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (startTimeRef.current && userId && articleId) {
      const finalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
      if (finalTimeSpent > 0) {
        trackInteraction(userId, articleId, finalTimeSpent, categoryName);
      }
    }
  }, [userId, articleId, categoryName]);

  // React to active/inactive transitions
  useEffect(() => {
    if (!userId || !articleId) return;

    if (isActive && !wasActiveRef.current) {
      // became active
      wasActiveRef.current = true;
      startTimer();
    } else if (!isActive && wasActiveRef.current) {
      // became inactive
      wasActiveRef.current = false;
      stopTimerAndSend();
      setTimeSpent(0);
    }
  }, [isActive, userId, articleId, startTimer, stopTimerAndSend]);

  // Cleanup on unmount: if still active, flush time
  useEffect(() => {
    return () => {
      if (wasActiveRef.current) {
        stopTimerAndSend();
      } else if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [stopTimerAndSend]);

  return { timeSpent };
};

/**
 * Internal function to send tracking data to backend
 * @private
 */
async function trackInteraction(userId, articleId, timeSpentSeconds, categoryName) {
  try {
    const response = await api.post('/api/recommendations/smart/track', {
      user_id: userId,
      article_id: articleId,
      time_spent_seconds: timeSpentSeconds,
      category_name: categoryName,
    });

    if (response.data.success) {
      console.log(
        `✅ Tracked: ${timeSpentSeconds}s on article ${articleId} (${categoryName})`
      );
      // Trigger a custom event to notify components to refetch recommendations
      console.log('🔔 Dispatching interactionTracked event for userId:', userId);
      window.dispatchEvent(new CustomEvent('interactionTracked', { detail: { userId, categoryName } }));
    }
  } catch (error) {
    const details = error?.response?.data || {};
    console.warn('⚠️ Failed to track interaction:', error.message, details);
    // Silently fail - don't disrupt user experience
  }
}

export const useSmartRecommendations = (userId, limit = 10) => {
  const [recommendations, setRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userIdRef = useRef(userId);
  const limitRef = useRef(limit);

  useEffect(() => {
    userIdRef.current = userId;
    limitRef.current = limit;
  }, [userId, limit]);

  const fetchRecommendations = useCallback(async () => {
    const currentUserId = userIdRef.current;
    const currentLimit = limitRef.current;

    if (!currentUserId) {
      setRecommendations([]);
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        '/api/recommendations/smart/category-based',
        {
          params: {
            user_id: currentUserId,
            limit: currentLimit,
          },
        }
      );

      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
        setAnalysis(response.data.analysis || null);
      } else {
        setRecommendations([]);
        setAnalysis(null);
        setError(response.data.message || 'No recommendations available');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
      setRecommendations([]);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - stable reference

  // Auto-fetch on mount and when userId changes
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Auto-refresh when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        console.log('👁️ Page became visible - refetching recommendations');
        fetchRecommendations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchRecommendations, userId]);

  // Poll for fresh recommendations every 5 minutes
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchRecommendations();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchRecommendations, userId]);

  // Listen for interaction tracking events to refetch immediately
  useEffect(() => {
    if (!userId) return;
    let timeoutId;
    const handleInteractionTracked = (event) => {
      console.log('🎯 Received interactionTracked event:', event.detail, 'Current userId:', userId);
      if (event.detail.userId === userId) {
        console.log('✨ Refetching recommendations for category:', event.detail.categoryName);
        // Immediate refetch (removed debounce for instant updates)
        clearTimeout(timeoutId);
        fetchRecommendations();
      }
    };
    window.addEventListener('interactionTracked', handleInteractionTracked);
    console.log('👂 Listening for interactionTracked events for userId:', userId);
    return () => {
      console.log('🔇 Stopped listening for interactionTracked events');
      window.removeEventListener('interactionTracked', handleInteractionTracked);
      clearTimeout(timeoutId);
    };
  }, [fetchRecommendations, userId]);

  return {
    recommendations,
    loading,
    error,
    analysis,
    refetch: fetchRecommendations,
  };
};

export const useUserStats = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        '/api/recommendations/smart/user-stats',
        {
          params: { user_id: userId },
        }
      );

      if (response.data.success) {
        setStats(response.data.stats || null);
      } else {
        setStats(null);
        setError('Failed to load stats');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useInteractionTimer;
