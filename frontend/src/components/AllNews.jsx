// AllNews.jsx
// Aggregated "latest" feed across all categories.
// Responsibilities: fetch summarized articles once on mount, normalize backend payload
// for card/reel consumption, gate extra results for guests, and launch ReelView overlay.

// --- Imports ---
import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import ReelView from "./ReelView"; // Component for the full-screen story view

// --- Helper Functions ---
/**
 * A simple helper to get the current date in a long format.
 * @returns {string} The formatted date string (e.g., "Sunday, October 12, 2025").
 */
const getFormattedDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Component: fetches + renders all news; manages ReelView open/index state.
import notify from "../utils/toast";

export default function AllNews({ userProfile, onLoginClick }) {
  // --- State Management ---
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to manage the reel view modal.
  // `isOpen` toggles visibility, `index` tracks the starting article.
  const [reelState, setReelState] = useState({ isOpen: false, index: 0 });

  // --- Data Fetching ---
  // Fetches news data from backend DB when the component mounts.
  useEffect(() => {
    const fetchNewsFromApi = async () => {
      setLoading(true);
      try {
        // Fetch summarized news from backend (DB-first endpoint)
        const resp = await fetch(
          `${import.meta.env.VITE_API_BASE || "http://localhost:4000"
          }/get-summarized-news`
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const payload = await resp.json();

        // backend returns { summarizedNews: [...] }
        const articles = Array.isArray(payload.summarizedNews)
          ? payload.summarizedNews
          : [];

        // Normalize fields for NewsCard component
        const normalized = articles.map((a) => ({
          id: a.id || a.original_url || a.newsUrl || a.title,
          title: a.title,
          summary: a.summary || a.content_text || "",
          imageUrl: a.imageUrl || a.image_url || a.thumbnail || null,
          newsUrl: a.newsUrl || a.original_url || a.link || "",
          source:
            typeof a.source === "string"
              ? a.source
              : a.source?.name || "Unknown",
          timestamp:
            a.timestamp ||
            (a.published_at
              ? new Date(a.published_at).toLocaleString()
              : "Recently"),
          category: a.category || a.topic || "General",
        }));

        setNews(normalized);
      } catch (err) {
        console.error("Error fetching news from API:", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsFromApi();
  }, []); // Empty dependency array ensures this runs only once on mount.

  // --- Event Handlers ---
  /**
   * Opens the ReelView, starting at the article that was clicked.
   * @param {number} index - The index of the clicked news card.
   */
  const handleCardClick = (index) => {
    setReelState({ isOpen: true, index: index });
  };

  /**
   * Closes the ReelView and resets its state.
   */
  const handleCloseReel = () => {
    setReelState({ isOpen: false, index: 0 });
  };

  // --- Conditional Rendering: Loading State ---
  // Display skeleton cards while data is being fetched.
  if (loading) {
    return (
      <main className="bg-newspaper min-h-screen pt-24">
        <div className="px-4 lg:px-10 py-12 w-full">
          <div className="w-full mx-auto">
            {/* Skeleton Header */}
            <div className="text-center mb-10">
              <div
                className="h-16 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded-lg mb-4 mx-auto max-w-xl animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
              <div
                className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded mx-auto max-w-md mb-2 animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
              <div
                className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded mx-auto max-w-sm animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
            </div>
            {/* Skeleton Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-md">
                  <div
                    className="h-64 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 animate-pulse"
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  ></div>
                  <div className="p-4 space-y-3">
                    <div
                      className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded w-3/4 animate-pulse"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    ></div>
                    <div
                      className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded animate-pulse"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    ></div>
                    <div
                      className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded w-5/6 animate-pulse"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </main>
    );
  }

  // --- Render ---
  return (
    <main className="bg-newspaper text-zinc-900 pt-24">
      <div className="px-4 lg:px-10 py-12 w-full">
        <div className="w-full mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-3">
              Today's Headlines
            </h1>
            <p className="text-stone-600 mb-4">
              AI-powered news summaries • Real-time updates • All the news that
              matters
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 50%,#ff0066 100%)",
                  }}
                ></span>
                Live Updates
              </div>
              <span>•</span>
              <span>{getFormattedDate()}</span>
            </div>
          </div>

          <hr className="border-stone-300 mb-10" />

          <h2 className="font-serif text-3xl font-bold mb-6 text-center">
            Featured Stories
          </h2>

          {/* News Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.length > 0 ? (
              (userProfile ? news : news.slice(0, 6)).map((item, index) => (
                <NewsCard
                  key={item.id || item.title}
                  {...item}
                  userProfile={userProfile}
                  onCardClick={() => handleCardClick(index)}
                />
              ))
            ) : (
              <p className="text-stone-500">No news available</p>
            )}
          </div>

          {/* View More for unauthenticated users */}
          {!userProfile && news.length > 6 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  notify.info("🔒 Please login to view more headlines");
                  if (onLoginClick) onLoginClick();
                }}
                className="px-6 py-3 rounded-full text-white transition-colors"
                style={{
                  background:
                    "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
                  boxShadow:
                    "0 4px 14px -2px rgba(255,0,80,0.45),0 2px 6px -1px rgba(0,0,0,0.25)",
                }}
              >
                View More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conditionally render the ReelView overlay when a card is clicked. */}
      {reelState.isOpen && (
        <ReelView
          news={news}
          initialIndex={reelState.index}
          onClose={handleCloseReel}
          userProfile={userProfile}
          onRequireLogin={onLoginClick}
        />
      )}
    </main>
  );
}
