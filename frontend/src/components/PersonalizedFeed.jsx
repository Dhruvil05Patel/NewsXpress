// PersonalizedFeed.jsx
// Hybrid/content-based personalized recommendation feed with ReelView launcher.

import React, { useState, useEffect } from "react";
import { usePersonalizedRecommendations } from "../hooks/useRecommendations";
import SmartRecommendations from "./SmartRecommendations";
import NewsCard from "./NewsCard";
import recommendationService from "../services/recommendations";
import ReelView from "./ReelView";

const PersonalizedFeed = ({ userId, method = "hybrid", topN = 10 }) => {
  const { recommendations, loading, error } = usePersonalizedRecommendations(
    userId,
    topN,
    method
  );
  const [reelOpen, setReelOpen] = useState(false);
  const [reelIndex, setReelIndex] = useState(0);
  const [reelNews, setReelNews] = useState([]);

  // Update page title
  useEffect(() => {
    document.title = "Personalized Feed | NewsXpress";
  }, []);

  const handleArticleClick = async (articleId) => {
    // Track click on personalized recommendation
    await recommendationService.trackClick(
      articleId,
      userId,
      "personalized_feed",
      method
    );
    // Delegate to parent or routing logic
  };

  // Open ReelView at selected index
  const handleOpenReel = (articles, index) => {
    setReelNews(articles);
    setReelIndex(index);
    setReelOpen(true);
  };

  // Close ReelView overlay
  const handleCloseReel = () => {
    setReelOpen(false);
  };

  if (!userId) {
    return (
      <div className="personalized-feed lg:pt-10" style={{}}>
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
      <div className="w-full lg:pt-10">
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
