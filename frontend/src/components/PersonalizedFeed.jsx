// PersonalizedFeed.jsx
// Hybrid/content-based personalized recommendation feed with SmartRecommendations component and ReelView launcher.

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

  // Title
  useEffect(() => {
    document.title = "Personalized Feed | NewsXpress";
  }, []);

  // -----------------------------------------
  // Handlers
  // -----------------------------------------
  const handleArticleClick = async (articleId) => {
    // Track click
    await recommendationService.trackClick(
      articleId,
      userId,
      "personalized_feed",
      method
    );
  };

  // Open reel
  const handleOpenReel = (articles, index) => {
    setReelNews(articles);
    setReelIndex(index);
    setReelOpen(true);
  };

  // Close reel
  const handleCloseReel = () => {
    setReelOpen(false);
  };

  if (!userId) {
    return (
      <div className="personalized-feed lg:pt-10">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <p className="text-gray-600">
          Please sign in to see personalized recommendations.
        </p>
      </div>
    );
  }

  // Render smart recommendations + reel
  return (
    <>
      {/* ------------------------------------- */}
      {/* SMART RECOMMENDER SECTION */}
      {/* ------------------------------------- */}
      <div className="w-full lg:pt-10">
        <SmartRecommendations
          userId={userId}
          limit={200}
          title="Smart Recommendations for You"
          onArticleClick={handleOpenReel}
        />
      </div>

      {/* ------------------------------------- */}
      {/* FALLBACK PERSONALIZED FEED */}
      {/* ------------------------------------- */}
      {!loading && recommendations.length > 0 && (
        <div className="mt-10 px-4">
          <h2 className="text-xl font-bold mb-4">More for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={() => handleArticleClick(article.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* REEL VIEW (Full Screen Vertical Swipe) */}
      {/* ------------------------------------- */}
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
