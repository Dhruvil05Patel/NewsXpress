import { useState, useEffect } from "react";
import NewsCard from "../NewsCard";
import sampleNews from "../mockNews";

// Component to display only environment-related news
export default function EnvironmentNews() {
    // State to hold filtered environment news
    const [news, setNews] = useState([]);

    // Filter and load environment news when component mounts
    useEffect(() => {
        setNews(sampleNews.filter((item) => item.category === "Environment"));
    }, []);

    return (
        // Main content area (adjusted for sidebar layout)
        <main className="relative z-10 pt-16 transition-all lg:ml-64">
            <div className="px-4 sm:px-6 lg:px-10 py-8">
                {/* Page heading */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Environment News
                </h1>

                {/* Page subheading */}
                <p className="text-gray-600 mb-8 text-sm sm:text-base">
                    Latest environment updates
                </p>

                {/* Grid layout for news cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {news.length > 0 ? (
                        // Show each environment news item
                        news.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-transform transform hover:-translate-y-1"
                            >
                                <NewsCard {...item} />
                            </div>
                        ))
                    ) : (
                        // Message if no environment news found
                        <p className="text-gray-500">No Environment news available</p>
                    )}
                </div>
            </div>
        </main>
    );
}
