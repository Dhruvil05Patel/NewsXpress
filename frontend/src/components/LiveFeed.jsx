import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// LiveFeed page - fetches and displays YouTube live streams from backend
export default function LiveFeed() {
    const navigate = useNavigate();
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set page title on mount
    useEffect(() => {
        document.title = "Live Feed | NewsXpress";
    }, []);

    useEffect(() => {
        async function fetchStreams() {
            try {
                setLoading(true);
                setError(null);
                // Use absolute URL if running frontend separately
                const backendUrl =
                    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000";
                const res = await fetch(`${backendUrl}/api/live-streams`);
                if (!res.ok) throw new Error("Failed to fetch live streams");
                const data = await res.json();
                setStreams(Array.isArray(data) ? data : data.items || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStreams();
    }, []);

    return (
        <div className="min-h-screen pt-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Live Feed</h1>
                        <p className="text-sm text-gray-600">
                            Watch live broadcasts and streams.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-red-50"
                        >
                            Back
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-gray-900">Live Now</h2>
                        {loading ? (
                            <p className="text-sm text-gray-600">Loading live streams...</p>
                        ) : error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : streams.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                No live stream available. Check back later or visit our YouTube
                                channel.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {streams.map((stream, idx) => {
                                    const videoId = stream.id?.videoId || stream.videoId;
                                    const title =
                                        stream.snippet?.title || stream.title || "Live Stream";
                                    const channelTitle =
                                        stream.snippet?.channelTitle || stream.channelTitle;
                                    const thumbnail =
                                        stream.snippet?.thumbnails?.medium?.url ||
                                        stream.snippet?.thumbnails?.default?.url;

                                    return (
                                        <div
                                            key={videoId || idx}
                                            className="bg-gray-50 rounded-lg overflow-hidden shadow-sm"
                                        >
                                            <div className="aspect-video w-full">
                                                <iframe
                                                    title={title}
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${videoId}`}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                    {title}
                                                </h3>
                                                {channelTitle && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {channelTitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
