// src/components/ReelView.jsx

// --- Imports ---
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReelCard from "./ReelCard";

/**
 * A full-screen overlay component that displays news articles in a vertically
 * scrollable "reel" format.
 */
export default function ReelView({
  news = [],
  initialIndex = 0,
  onClose,
  userProfile,
  onRequireLogin,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);
  const audioPlayersRef = useRef([]);

  // Lock body scroll while reel is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();

    if (scrollTimeout.current) return; // Prevent rapid scrolling

    const delta = e.deltaY;
    const maxIndex = userProfile
      ? news.length - 1
      : Math.min(5, news.length - 1);

    if (delta > 0) {
      // Scroll DOWN -> Next
      if (currentIndex < maxIndex) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        if (!userProfile && onRequireLogin) onRequireLogin();
      }
    } else if (delta < 0) {
      // Scroll UP -> Prev
      if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    }

    // throttle
    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 500);
  };

  // Touch handling
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) < 50) {
      setTouchStart(null);
      return;
    }
    const maxIndex = userProfile
      ? news.length - 1
      : Math.min(5, news.length - 1);
    if (diff > 0) {
      // swipe up -> next
      if (currentIndex < maxIndex) setCurrentIndex((prev) => prev + 1);
      else if (!userProfile && onRequireLogin) onRequireLogin();
    } else {
      // swipe down -> prev
      if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    }
    setTouchStart(null);
  };

  // --- Render ---
  return (
    <div className="fixed top-16 bottom-0 left-0 right-0 z-50 bg-white">
      <div className="h-full w-full flex">
        <div className="hidden lg:block w-[10%] bg-white" />

        <div className="w-full lg:w-[80%] h-full bg-black relative mx-auto">
          <button
            onClick={() => {
              // pause audio players
              audioPlayersRef.current.forEach((audioPlayer) => {
                if (audioPlayer && audioPlayer.current)
                  audioPlayer.current.pause();
              });
              if (onClose) onClose();
            }}
            className="absolute top-4 right-4 z-[60] text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
            aria-label="Close reel view"
          >
            <X size={24} />
          </button>

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
                  <ReelCard
                    {...item}
                    userProfile={userProfile}
                    isActive={index === currentIndex}
                    audioPlayersRef={audioPlayersRef}
                    cardIndex={index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[10%] bg-white" />
      </div>
    </div>
  );
}
