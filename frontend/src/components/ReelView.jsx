// src/components/ReelView.jsx

// --- Imports ---
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReelCard from "./ReelCard";

/**
 * A full-screen overlay component that displays news articles in a vertically
 * scrollable "reel" format, similar to social media stories.
 * @param {object} props - The component's properties.
 * @param {Array} props.news - The array of news article objects to display.
 * @param {number} props.initialIndex - The index of the article to show first.
 * @param {Function} props.onClose - The function to call when closing the view.
 */
export default function ReelView({ news, initialIndex, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const containerRef = useRef(null);
    const scrollTimeout = useRef(null);

    // Lock body scroll when mounted
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleWheel = (e) => {
        e.preventDefault();

        if (scrollTimeout.current) return; // Prevent rapid scrolling

        const delta = e.deltaY;

        if (delta > 0 && currentIndex < news.length - 1) {
            // Scroll DOWN (delta > 0) -> Go to NEXT slide
            setCurrentIndex((prev) => prev + 1);
        } else if (delta < 0 && currentIndex > 0) {
            // Scroll UP (delta < 0) -> Go to PREVIOUS slide
            // --- THIS IS THE CORRECTED LINE ---
            setCurrentIndex((prev) => prev - 1);
        }

        // Add a small delay between scroll events
        scrollTimeout.current = setTimeout(() => {
            scrollTimeout.current = null;
        }, 500);
    };

    // Handle touch events
    const [touchStart, setTouchStart] = useState(null);

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) < 50) return; // Ignore small taps/drags

        if (diff > 0 && currentIndex < news.length - 1) {
            // Swipe UP (diff > 0) -> Go to NEXT slide
            setCurrentIndex((prev) => prev + 1);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe DOWN (diff < 0) -> Go to PREVIOUS slide
            setCurrentIndex((prev) => prev - 1);
        }

        setTouchStart(null);
    };

    // --- Render ---
    return (
        // Main fixed-position overlay that covers the entire screen.
        <div className="fixed top-16 bottom-0 left-0 right-0 lg:ml-64 xl:mr-80 z-50 bg-black">
            {/* A persistent close button in the top-right corner. */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[60] text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
                aria-label="Close reel view"
            >
                <X size={24} />
            </button>

            {/* Reel Container */}
            <div
                ref={containerRef}
                className="h-full w-full snap-y snap-mandatory overflow-hidden"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateY(-${currentIndex * 100}%)` }}
                >
                    {news.map((item, index) => (
                        <div
                            key={item.id || item.title}
                            className="h-full w-full snap-start"
                        >
                            <ReelCard {...item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}