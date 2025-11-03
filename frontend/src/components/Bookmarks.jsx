import React, { useState, useEffect } from "react";

/**
 * Simple Bookmarks page.
 * - reads bookmarks from localStorage key "bookmarks" (array of news objects)
 * - shows grid of bookmarked items
 * - allows removing a bookmark (updates localStorage)
 */
export default function Bookmarks() {
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("bookmarks");
            setBookmarks(raw ? JSON.parse(raw) : []);
        } catch {
            setBookmarks([]);
        }
    }, []);

    const removeBookmark = (idOrTitle) => {
        const next = bookmarks.filter((b) => (b.id || b.title) !== idOrTitle);
        setBookmarks(next);
        localStorage.setItem("bookmarks", JSON.stringify(next));
    };

    if (!bookmarks.length) {
        return (
            <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
                <div className="px-4 lg:px-10 py-12 w-full">
                    <div className="w-full mx-auto text-center">
                        <h1 className="font-serif text-4xl font-bold mb-4">My Bookmarks</h1>
                        <p className="text-stone-500">You have no saved articles yet.</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
            <div className="px-4 lg:px-10 py-12 w-full">
                <div className="w-full mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="font-serif text-4xl font-bold mb-2">My Bookmarks</h1>
                        <p className="text-stone-600">Saved articles for later reading</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarks.map((item) => {
                            const key = item.id || item.title;
                            return (
                                <article
                                    key={key}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                                >
                                    {item.imageUrl && (
                                        <a
                                            href={item.newsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-44 object-cover"
                                            />
                                        </a>
                                    )}
                                    <div className="p-4">
                                        <a
                                            href={item.newsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <h3 className="font-semibold text-lg text-zinc-900 line-clamp-2">
                                                {item.title}
                                            </h3>
                                        </a>
                                        {item.source && (
                                            <p className="text-sm text-stone-500 mt-2">
                                                {item.source} • {item.timestamp}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <a
                                                href={item.newsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md"
                                            >
                                                Read
                                            </a>
                                            <button
                                                onClick={() => removeBookmark(key)}
                                                className="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-md"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
