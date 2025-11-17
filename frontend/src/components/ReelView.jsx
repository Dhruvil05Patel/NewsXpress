// ReelView.jsx
// Full-screen vertical reel viewer with snap scrolling.
// Responsibilities: manage active index, throttle wheel/touch navigation,
// pause any playing audio on exit, and enforce guest limit (first 6 items).

// --- Imports ---
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReelCard from "./ReelCard";

/** Overlay reel: maps normalized news array into stacked ReelCard slides. */
export default function ReelView({
  news = [],
  initialIndex = 0,
  onClose,
  userProfile,
  onRequireLogin,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const scrollTimeout = useRef(null);
  const audioPlayersRef = useRef([]);
  const containerRef = useRef(null); // needed for non-passive wheel listener
  const [childOverlayOpen, setChildOverlayOpen] = useState(false); // disable scroll when a child modal is open

  // Lock body scroll while reel is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, []);

  // Wheel handler (non-passive): we attach manually to allow preventDefault without warning.
  const handleWheel = (e) => {
    if (childOverlayOpen) return; // allow modal to handle its own scrolling
    e.preventDefault(); // suppress native scroll when no modal is open
    if (scrollTimeout.current) return;
    const delta = e.deltaY;
    const maxIndex = userProfile
      ? news.length - 1
      : Math.min(5, news.length - 1);
    if (delta > 0) {
      if (currentIndex < maxIndex) setCurrentIndex((prev) => prev + 1);
      else if (!userProfile && onRequireLogin) onRequireLogin();
    } else if (delta < 0) {
      if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    }
    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 500);
  };

  // Attach wheel listener with passive: false to avoid Chrome warning.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () =>
      el.removeEventListener("wheel", handleWheel, { passive: false });
  }, [handleWheel]);

  // Touch handling
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    if (childOverlayOpen) return;
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (childOverlayOpen) return;
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
                    onOverlayChange={setChildOverlayOpen}
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
