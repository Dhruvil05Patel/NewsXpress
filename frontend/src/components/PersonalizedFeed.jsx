// React Component: Personalized Feed

import React, { useState } from 'react';
import { usePersonalizedRecommendations } from '../hooks/useRecommendations';
import SmartRecommendations from './SmartRecommendations';
import NewsCard from './NewsCard';
import recommendationService from '../services/recommendations';
import ReelView from './ReelView';

const PersonalizedFeed = ({ userId, method = 'hybrid', topN = 10 }) => {
  const { recommendations, loading, error } = usePersonalizedRecommendations(userId, topN, method);
  const [reelOpen, setReelOpen] = useState(false);
  const [reelIndex, setReelIndex] = useState(0);
  const [reelNews, setReelNews] = useState([]);

  const handleArticleClick = async (articleId) => {
    // Track click on personalized recommendation
    await recommendationService.trackClick(articleId, userId, 'personalized_feed', method);
    // Delegate to parent or routing logic
  };

  const handleOpenReel = (articles, index) => {
    setReelNews(articles);
    setReelIndex(index);
    setReelOpen(true);
  };

  const handleCloseReel = () => {
    setReelOpen(false);
  };

  if (!userId) {
    return (
      <div className="personalized-feed">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <p className="text-gray-600">
          Please sign in to see personalized recommendations.
        </p>
      </div>
    );
  }

  // Show smart recommendations first if available
  return (
    <>
      <div className="w-full">
        <SmartRecommendations 
          userId={userId} 
          limit={200} 
          title="Smart Recommendations for You"
          onArticleClick={handleOpenReel}
        />
      </div>
      
      {reelOpen && (
        <ReelView
          news={reelNews}
          initialIndex={reelIndex}
          onClose={handleCloseReel}
          userProfile={{ id: userId }}
        />
      )}
    </>
  );
};

export default PersonalizedFeed;
