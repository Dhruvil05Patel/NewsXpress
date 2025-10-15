// src/components/ReelView.jsx

// --- Imports ---
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReelCard from "./ReelCard"; // The component for rendering a single story in the reel

/**
 * A full-screen overlay component that displays news articles in a vertically
 * scrollable "reel" format, similar to social media stories.
 * @param {object} props - The component's properties.
 * @param {Array} props.news - The array of news article objects to display.
 * @param {number} props.initialIndex - The index of the article to show first.
 * @param {Function} props.onClose - The function to call when closing the view.
 */
export default function ReelView({ news, initialIndex, onClose }) {
    // --- Refs ---
    // Ref to hold an array of DOM elements, one for each card, to enable programmatic scrolling.
    const cardRefs = useRef([]);

    // --- Side Effects (useEffect) ---
    // Handles setup logic when the component first mounts.
    useEffect(() => {
        // Immediately scroll to the article that was clicked to open the reel view.
        if (cardRefs.current[initialIndex]) {
            // 'instant' behavior prevents a jarring scroll animation on initial load.
            cardRefs.current[initialIndex].scrollIntoView({ behavior: "instant" });
        }

        // Lock the body scroll to prevent the underlying page from moving.
        document.body.style.overflow = "hidden";

        // Cleanup function: This runs when the component is unmounted (closed).
        return () => {
            // Restore body scroll to normal.
            document.body.style.overflow = "auto";
        };
    }, [initialIndex]); // This effect runs only once on mount.

    // --- Render ---
    return (
        // Main fixed-position overlay that covers the entire screen.
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in">
            {/* A persistent close button in the top-right corner. */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
                aria-label="Close reel view"
            >
                <X size={24} />
            </button>

            {/* The scrollable container for all the news cards. */}
            {/* `snap-y snap-mandatory` enables vertical scroll-snapping for a reel effect. */}
            <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
                {news.map((item, index) => (
                    // This wrapper div serves as a full-height snap target.
                    <div
                        key={item.id || item.title}
                        // This callback populates the `cardRefs` array with the DOM node of each card.
                        ref={(el) => (cardRefs.current[index] = el)}
                        // `scroll-snap-align-start` ensures the top of the card aligns with the container.
                        className="h-screen w-full scroll-snap-align-start flex-shrink-0"
                    >
                        <ReelCard {...item} />
                    </div>
                ))}
            </div>
        </div>
    );
}
