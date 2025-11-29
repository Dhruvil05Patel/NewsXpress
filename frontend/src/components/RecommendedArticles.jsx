// RecommendedArticles: show similar articles under current article

import React from "react";
import {
  useSimilarArticles,
  useArticleTracking,
} from "../hooks/useRecommendations";
import NewsCard from "./NewsCard";
import recommendationService from "../services/recommendations";

const RecommendedArticles = ({
  currentArticleId,
  userId,
  title = "You May Also Like",
}) => {
  const { recommendations, loading, error } = useSimilarArticles(
    currentArticleId,
    6
  );
  const { trackClick } = useArticleTracking();

  const handleArticleClick = async (articleId) => {
    // Track click
    await recommendationService.trackClick(
      articleId,
      userId,
      "recommended_section",
      "content"
    );
    // Delegate to parent or routing logic
  };

  if (!currentArticleId) {
    return null;
  }

  if (loading) {
    return (
      <div className="recommended-section">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommended-section my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article.id)}
            className="cursor-pointer"
          >
            <NewsCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedArticles;
