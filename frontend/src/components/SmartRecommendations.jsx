import React, { useState } from 'react';
import { useSmartRecommendations } from '../hooks/useInteractionTimer';
import NewsCard from './NewsCard';
import { BarChart3, Clock, BookOpen } from 'lucide-react';

/**
 * SmartRecommendations Component
 * Displays personalized recommendations based on user's reading behavior and time spent on articles
*/
const SmartRecommendations = ({ userId, limit = 10, title = 'Recommended For You', onArticleClick }) => {
  const { recommendations, loading, error, analysis, refetch } = useSmartRecommendations(userId, limit);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update timestamp when recommendations change
  React.useEffect(() => {
    if (recommendations.length > 0) {
      setLastUpdated(new Date());
    }
  }, [recommendations]);

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await refetch();
    setLastUpdated(new Date());
  };

  const handleCardClick = (index) => {
    if (!onArticleClick) return;
    // Normalize articles for ReelView format
    const normalizedArticles = recommendations.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      imageUrl: article.image_url,
      newsUrl: article.url || article.original_url,
      source: article.source || 'NewsXpress',
      timestamp: article.published_at ? new Date(article.published_at).toLocaleDateString() : '',
      category: article.category || article.topic,
    }));
    onArticleClick(normalizedArticles, index);
  };

  if (!userId) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="my-8 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-2"></div>
              <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error or no recommendations state
  if (error || !recommendations || recommendations.length === 0) {
    return (
      <div className="my-8 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {title}
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Keep Reading to Get Personalized Recommendations
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Read at least 5 articles to unlock smart recommendations based on your interests.
            We'll analyze the categories you spend the most time on to suggest relevant articles.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Category Analysis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Recommendations available
  return (
    <div className="my-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {analysis && (
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          )}
        </div>
      </div>

      {/* Analysis Panel */}
      {showAnalysis && analysis && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-indigo-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Your Reading Preferences
          </h3>

          {/* Top Categories */}
          {analysis.top_categories && analysis.top_categories.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Top Categories
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.top_categories.map((category, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {category.category}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {formatSeconds(category.total_time_seconds)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.article_count} article{category.article_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-block bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            #{idx + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-indigo-200 dark:border-gray-600">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                ARTICLES READ
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {analysis.total_interaction_count || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                TIME SPENT
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {formatSeconds(analysis.total_time_spent_seconds || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                AVG PER ARTICLE
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {formatSeconds(
                  analysis.total_interaction_count > 0
                    ? Math.round(analysis.total_time_spent_seconds / analysis.total_interaction_count)
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recommendations.map((article, index) => {
          // Map backend fields to NewsCard props
          const mappedArticle = {
            title: article.title,
            summary: article.summary,
            imageUrl: article.image_url,
            newsUrl: article.url || article.original_url,
            source: article.source || 'NewsXpress',
            timestamp: article.published_at ? new Date(article.published_at).toLocaleDateString() : '',
            category: article.category || article.topic,
          };
          
          return (
            <div 
              key={article.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCardClick(index)}
            >
              <NewsCard {...mappedArticle} />
            </div>
          );
        })}
      </div>
      
      {/* Show count of displayed recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {recommendations.length} personalized article{recommendations.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Footer Note */}
      {analysis && (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Recommendations are based on your reading behavior in{' '}
            <span className="font-semibold text-gray-800 dark:text-white">
              {analysis.top_categories && analysis.top_categories.length > 0
                ? analysis.top_categories
                    .slice(0, 2)
                    .map((c) => c.category)
                    .join(' & ')
                : 'various categories'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

function formatSeconds(seconds) {
  if (!seconds || seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export default SmartRecommendations;
