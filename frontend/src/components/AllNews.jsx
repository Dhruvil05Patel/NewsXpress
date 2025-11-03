// src/components/categories/AllNews.jsx

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

/**
 * The AllNews component fetches and displays a list of all news articles.
 * It also manages the state for opening a full-screen "reel" view.
 */
export default function AllNews() {
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
                const resp = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/get-summarized-news?limit=20`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const payload = await resp.json();

                // backend returns { summarizedNews: [...] }
                const articles = Array.isArray(payload.summarizedNews) ? payload.summarizedNews : [];

                // Normalize fields for NewsCard component
                const normalized = articles.map((a) => ({
                    id: a.id || a.original_url || a.newsUrl || a.title,
                    title: a.title,
                    summary: a.summary || a.content_text || "",
                    imageUrl: a.imageUrl || a.image_url || a.thumbnail || null,
                    newsUrl: a.newsUrl || a.original_url || a.link || "",
                    source: (typeof a.source === 'string') ? a.source : (a.source?.name || "Unknown"),
                    timestamp: a.timestamp || (a.published_at ? new Date(a.published_at).toLocaleString() : "Recently"),
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
    // Display a loading message while data is being fetched.
    if (loading) {
        return (
            <main className="bg-newspaper min-h-screen lg:ml-64 xl:mr-80 pt-24">
                <div className="flex justify-center items-center h-full">
                    <div className="font-serif text-lg text-stone-600">
                        Loading Headlines...
                    </div>
                </div>
            </main>
        );
    }

    // --- Render ---
    return (
        <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
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
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>Live
                                Updates
                            </div>
                            <span>•</span>
                            <span>{getFormattedDate()}</span>
                        </div>
                    </div>

                    <hr className="border-stone-300 mb-10" />

                    <h2 className="font-serif text-3xl font-bold mb-6 text-center">
                        Featured Stories
                    </h2>

                    {/* News Card Grid --- THIS IS THE UPDATED LINE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.length > 0 ? (
                            news.map((item, index) => (
                                <NewsCard
                                    key={item.id || item.title} // Use a stable key for each item.
                                    {...item} // Pass all news item properties as props.
                                    onCardClick={() => handleCardClick(index)} // Pass the handler to open the reel.
                                />
                            ))
                        ) : (
                            <p className="text-stone-500">No news available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Conditionally render the ReelView overlay when a card is clicked. */}
            {reelState.isOpen && (
                <ReelView
                    news={news}
                    initialIndex={reelState.index}
                    onClose={handleCloseReel}
                />
            )}
        </main>
    );
}