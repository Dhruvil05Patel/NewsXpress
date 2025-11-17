// React Component: Personalized Feed

import React from 'react';
import { usePersonalizedRecommendations } from '../hooks/useRecommendations';
import NewsCard from './NewsCard';
import recommendationService from '../services/recommendations';

const PersonalizedFeed = ({ method = 'hybrid', topN = 10 }) => {
  const { recommendations, loading, error } = usePersonalizedRecommendations(topN, method);

  const handleArticleClick = async (articleId) => {
    // Track click on personalized recommendation
    await recommendationService.trackActivity({
      articleId,
      activityType: 'click',
      source: 'recommendation',
      recommendationType: method,
    });
  };

  if (loading) {
    return (
      <div className="personalized-feed">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="bg-gray-300 h-32 w-48 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="personalized-feed">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <p className="text-red-500">Failed to load recommendations. Please try again later.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="personalized-feed">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <p className="text-gray-600">
          No recommendations available yet. Read more articles to get personalized suggestions!
        </p>
      </div>
    );
  }

  return (
    <div className="personalized-feed my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Recommended For You
        </h2>
        <span className="text-sm text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
          {method === 'hybrid' ? '🎯 Personalized' : '👥 Based on Similar Users'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((article, index) => (
          <div 
            key={article.id} 
            onClick={() => handleArticleClick(article.id)}
            className="relative"
          >
            {index < 3 && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                TOP {index + 1}
              </div>
            )}
            <NewsCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedFeed;
