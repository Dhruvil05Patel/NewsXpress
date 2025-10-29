// src/components/categories/CategoryNews.jsx

// --- Imports ---
import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import ReelView from "./ReelView";

// --- Component Definition ---
/**
 * A reusable component to display news articles for a specific category.
 * It receives the category details via props to dynamically render content.
 * @param {object} props - The component's properties.
 * @param {string} props.category - The category name to filter news by (e.g., "Technology").
 * @param {string} props.title - The title to display on the page header.
 * @param {string} props.subtitle - The subtitle to display below the title.
 */
export default function CategoryNews({ category, title, subtitle }) {
    // --- State Management ---
    const [news, setNews] = useState([]); // Holds the filtered list of news articles.
    const [loading, setLoading] = useState(true); // Manages the loading state.
    const [reelState, setReelState] = useState({ isOpen: false, index: 0 }); // Manages the reel view modal.

    // --- Side Effects (useEffect) ---
    // Fetch category-specific news from backend when `category` changes.
    useEffect(() => {
        setLoading(true);

        const loadCategory = async () => {
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/get-summarized-news/${encodeURIComponent(category)}?limit=20`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const payload = await resp.json();
                const articles = Array.isArray(payload.summarizedNews) ? payload.summarizedNews : [];

                const normalized = articles.map((a) => ({
                    id: a.id || a.original_url || a.newsUrl || a.title,
                    title: a.title,
                    summary: a.summary || a.content_text || "",
                    imageUrl: a.imageUrl || a.image_url || a.thumbnail || null,
                    newsUrl: a.newsUrl || a.original_url || a.link || "",
                    source: (typeof a.source === 'string') ? a.source : (a.source?.name || "Unknown"),
                    timestamp: a.timestamp || (a.published_at ? new Date(a.published_at).toLocaleString() : "Recently"),
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
    // Displays a dynamic loading message while the news is being filtered.
    if (loading) {
        return (
            <main className="bg-newspaper min-h-screen lg:ml-64 xl:mr-80 pt-24">
                <div className="flex justify-center items-center h-full">
                    <div className="font-serif text-lg text-stone-600">
                        Loading {title}...
                    </div>
                </div>
            </main>
        );
    }

    // --- Render ---
    return (
        // Using a React Fragment `<>` to return multiple elements without a wrapper div.
        <>
            <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
                <div className="px-4 lg:px-10 py-12 w-full">
                    <div className="w-full mx-auto">
                        {/* Header section dynamically displays the title and subtitle from props. */}
                        <div className="mb-10 text-center">
                            <h1 className="font-serif text-5xl font-bold mb-2">{title}</h1>
                            <p className="text-stone-600">{subtitle}</p>
                        </div>
                        <hr className="border-stone-300 mb-10" />

                        {/* News Card Grid */}
                        <div className="flex flex-col gap-8">
                            {news.length > 0 ? (
                                // Maps over the filtered `news` array to render a list of NewsCards.
                                news.map((item, index) => (
                                    <NewsCard
                                        key={item.id || item.title}
                                        {...item}
                                        onCardClick={() => handleCardClick(index)}
                                    />
                                ))
                            ) : (
                                // A fallback message if no articles are found for the category.
                                <p className="text-stone-500 text-center">
                                    No {category} news available at the moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Conditionally renders the ReelView overlay when a card is clicked. */}
            {reelState.isOpen && (
                <ReelView
                    news={news}
                    initialIndex={reelState.index}
                    onClose={handleCloseReel}
                />
            )}
        </>
    );
}