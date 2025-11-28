// CategoryNews.jsx
// Category-scoped feed. Fetches summarized articles for a single category on change,
// normalizes structure, limits guest visibility, and integrates ReelView overlay.

// --- Imports ---
import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import ReelView from "./ReelView";

// --- Component Definition ---
/** CategoryNews props:
 *  - category: backend category key for fetch
 *  - title/subtitle: display metadata
 *  - userProfile/onLoginClick: auth gating + login trigger
 */
export default function CategoryNews({
  category,
  title,
  subtitle,
  userProfile,
  onLoginClick,
  searchQuery = "",
}) {
  // --- State Management ---
  const [news, setNews] = useState([]); // Holds the filtered list of news articles.
  const [loading, setLoading] = useState(true); // Manages the loading state.
  const [reelState, setReelState] = useState({ isOpen: false, index: 0 }); // Manages the reel view modal.

  // Update page title based on category
  useEffect(() => {
    document.title = `${category} | NewsXpress`;
  }, [category]);

  // --- Side Effects (useEffect) ---
  // Fetch category-specific news from backend when `category` changes.
  useEffect(() => {
    setLoading(true);

    const loadCategory = async () => {
      try {
        const resp = await fetch(
          `${
            import.meta.env.VITE_API_BASE || "http://localhost:4000"
          }/get-summarized-news/${encodeURIComponent(category)}`
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const payload = await resp.json();
        const articles = Array.isArray(payload.summarizedNews)
          ? payload.summarizedNews
          : [];

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
          category: a.category || a.topic || category,
        }));

        setNews(normalized);
      } catch (err) {
        console.error("Error loading category news:", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [category]); // The key dependency: this effect re-runs if `category` changes.

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
  // Displays animated skeleton cards while the news is being filtered.
  if (loading) {
    return (
      <main className="bg-newspaper min-h-screen pt-24">
        <div className="px-4 lg:px-10 py-12 w-full">
          <div className="w-full mx-auto">
            {/* Skeleton Header */}
            <div className="mb-10 text-center">
              <div
                className="h-14 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded-lg mb-3 mx-auto max-w-lg animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
              <div
                className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded mx-auto max-w-md animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
            </div>
            <hr className="border-stone-300 mb-10" />
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
    // Using a React Fragment `<>` to return multiple elements without a wrapper div.
    <>
      <main className="bg-newspaper text-zinc-900 pt-24">
        <div className="px-4 lg:px-10 py-12 w-full">
          <div className="w-full mx-auto">
            {/* Header section dynamically displays the title and subtitle from props. */}
            <div className="mb-10 text-center">
              <h1 className="font-serif text-5xl font-bold mb-2">{title}</h1>
              <p className="text-stone-600">{subtitle}</p>
            </div>
            <hr className="border-stone-300 mb-10" />

            {(() => {
              const q = (searchQuery || "").trim().toLowerCase();
              const filteredNews = q
                ? news.filter(
                    (n) =>
                      (n.title || "").toLowerCase().includes(q) ||
                      (n.summary || "").toLowerCase().includes(q)
                  )
                : news;
              const visibleNews = userProfile
                ? filteredNews
                : filteredNews.slice(0, 6);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNews.length > 0 ? (
                    visibleNews.map((item, index) => (
                      <NewsCard
                        key={item.id || item.title}
                        {...item}
                        userProfile={userProfile}
                        onCardClick={() => handleCardClick(index)}
                      />
                    ))
                  ) : (
                    <p className="text-stone-500 text-center">
                      No matching {category} headlines.
                    </p>
                  )}
                </div>
              );
            })()}

            {(() => {
              const q = (searchQuery || "").trim().toLowerCase();
              const filteredLen = q
                ? news.filter(
                    (n) =>
                      (n.title || "").toLowerCase().includes(q) ||
                      (n.summary || "").toLowerCase().includes(q)
                  ).length
                : news.length;
              return !userProfile && filteredLen > 6 ? (
                <div className="flex justify-center mt-12 mb-8">
                  <button
                    onClick={() => {
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
              ) : null;
            })()}
          </div>
        </div>
      </main>

      {/* Conditionally renders the ReelView overlay when a card is clicked. */}
      {reelState.isOpen &&
        (() => {
          const q = (searchQuery || "").trim().toLowerCase();
          const filteredNews = q
            ? news.filter(
                (n) =>
                  (n.title || "").toLowerCase().includes(q) ||
                  (n.summary || "").toLowerCase().includes(q)
              )
            : news;
          return (
            <ReelView
              news={filteredNews}
              initialIndex={reelState.index}
              onClose={handleCloseReel}
              userProfile={userProfile}
              onRequireLogin={onLoginClick}
            />
          );
        })()}
    </>
  );
}
