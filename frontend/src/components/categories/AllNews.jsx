// src/components/AllNews.js

import { useState, useEffect } from "react";
import NewsCard from "../NewsCard";
import sampleNews from "../mockNews";

export default function AllNews({ title, subtitle }) {
    const [news, setNews] = useState([]);

    useEffect(() => {
        // In a real app, you would fetch data here
        setNews(sampleNews);
    }, []);

    return (
        // This main tag positions the content correctly relative to the sidebar
        <main className="relative z-10 pt-16 transition-all lg:ml-64">
            <div className="px-4 sm:px-6 lg:px-10 py-8">
                <div className="w-full">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-600 mb-8 text-sm sm:text-base">{subtitle}</p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {news.length > 0 ? (
                            news.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-transform transform hover:-translate-y-1"
                                >
                                    <NewsCard {...item} />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No news available</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}