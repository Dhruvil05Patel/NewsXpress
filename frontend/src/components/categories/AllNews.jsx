import { useState, useEffect } from "react";
import NewsCard from "../NewsCard";
import { getSummarizedNews } from "../../services/api";

/**
 * Displays a grid of news articles. This component manages fetching
 * the news data and rendering it in a responsive layout.
 */
export default function AllNews({ title, subtitle }) {
    // State to store the list of news articles.
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This effect runs once when the component mounts to load the news data.
    // In a real app, this is where you would fetch data from an API.
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await getSummarizedNews();
                setNews(response.summarizedNews || []);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Failed to load news. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []); // The empty dependency array [] ensures this effect runs only once.
    
    if (loading) {
        return (
            <main className="relative z-10 pt-16 transition-all lg:ml-64">
                <div className="px-4 sm:px-6 lg:px-10 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading news...</div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="relative z-10 pt-16 transition-all lg:ml-64">
                <div className="px-4 sm:px-6 lg:px-10 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-red-600">{error}</div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="relative z-10 pt-16 transition-all lg:ml-64">
            <div className="px-4 sm:px-6 lg:px-10 py-8">
                <div className="w-full">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-600 mb-8 text-sm sm:text-base">{subtitle}</p>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {/* Check if news data exists before attempting to display it. */}
                        {news.length > 0 ? (
                            // If news is available, loop over the array to render a card for each article.
                            news.map((item) => (
                                <div
                                    // The 'key' prop is essential for React to efficiently update lists.
                                    key={item.link || item.newsUrl || item.title}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-transform transform hover:-translate-y-1"
                                >
                                    <NewsCard {...item} />
                                </div>
                            ))
                        ) : (
                            // If the news array is empty, display a fallback message.
                            <p className="text-gray-500">No news available</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
