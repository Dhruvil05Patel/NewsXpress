import React, { useEffect, useState } from "react";
import defaultImg from "./Default.png"; // Fallback image for missing/failed loads
// ReelCard: full-screen immersive article representation for vertical reel view.
// Features: translation (language selector), text-to-speech playback, bookmarking with note modal,
// active state coordination (pauses audio when swiped away), and gradient overlay for readability.
// Props include: isActive (current viewport card), audioPlayersRef (parent-managed for global pause),
// userProfile for gating advanced actions, and cardIndex for registration.
import {
  SquareArrowOutUpRight,
  Languages,
  Volume2,
  VolumeX,
  LoaderCircle,
  Bookmark,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useTranslation } from "../hooks/useTranslation";
import { useInteractionTimer } from "../hooks/useInteractionTimer";
import notify from "../utils/toast";
import { isBadImage, markBadImage } from "../utils/badImageCache";
import { addBookmark, removeBookmarkApi } from "../services/api";

export default function ReelCard({
  title,
  summary,
  imageUrl,
  newsUrl,
  source,
  timestamp,
  category,
  userProfile,
  isActive,
  audioPlayersRef,
  cleanupFunctionsRef,
  cardIndex,
  onOverlayChange,
  articleId,
}) {
  // Track time spent on article for analytics (value not displayed)
  useInteractionTimer(userProfile?.id, articleId, category, isActive);

  // Use custom hooks for translation + TTS.
  const {
    isTranslated,
    translatedContent,
    isTranslating,
    selectedLanguage,
    isLangSelectorOpen,
    setIsLangSelectorOpen,
    handleTranslateClick,
    performTranslation,
  } = useTranslation();

  const { isSpeaking, isFetchingAudio, handleListen, audioPlayer, cleanup } =
    useTextToSpeech(selectedLanguage);

  // Bookmark local state + note modal.
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNoteDraft, setBookmarkNoteDraft] = useState("");

  // Load existing bookmarks from localStorage to reflect state on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookmarks");
      if (raw) {
        const arr = JSON.parse(raw);
        const found = arr.find(
          (b) => b.title === title || (b.id && b.id === title)
        );
        if (found) {
          setIsBookmarked(true);
          if (found.note) setBookmarkNote(found.note);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [title]);

  // Register this card's audio player in the parent ref array (for coordinated stop).
  useEffect(() => {
    if (audioPlayersRef && audioPlayer) {
      audioPlayersRef.current[cardIndex] = audioPlayer;
    }
  }, [audioPlayersRef, audioPlayer, cardIndex]);

  // Register this card's cleanup function in the parent ref array
  useEffect(() => {
    if (cleanupFunctionsRef) {
      cleanupFunctionsRef.current[cardIndex] = cleanup;
    }
  }, [cleanupFunctionsRef, cleanup, cardIndex]);

  // Stop TTS playback and abort fetch when card leaves active viewport.
  useEffect(() => {
    if (!isActive && (isSpeaking || isFetchingAudio)) {
      cleanup();
    }
  }, [isActive, isSpeaking, isFetchingAudio, cleanup]);

  // Translation click handler: auth gate + toggle language selector.
  const onTranslateClick = (e) => {
    e.stopPropagation();
    if (!userProfile) {
      notify.warn("Please log in to use the translation feature");
      return;
    }
    handleTranslateClick();
  };

  // Inform parent (ReelView) when the language selector overlay opens/closes
  useEffect(() => {
    if (onOverlayChange) onOverlayChange(!!isLangSelectorOpen);
  }, [isLangSelectorOpen, onOverlayChange]);

  // Perform translation for selected language using current title/summary.
  const onSelectLanguage = (targetLanguage) => {
    performTranslation(title, summary, targetLanguage);
  };

  // TTS initiation using translated summary if available, else fallback order.
  const onListenClick = async (e) => {
    e.stopPropagation();
    if (!userProfile) {
      notify.warn("Please log in to use text-to-speech");
      return;
    }
    const textToSpeak =
      (isTranslated ? translatedContent.summary : summary) ||
      (isTranslated ? translatedContent.title : title);
    await handleListen(textToSpeak);
  };

  const onBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!userProfile) {
      notify.warn("Please log in to bookmark articles");
      return;
    }

    // If already bookmarked, remove it.
    if (isBookmarked) {
      try {
        // Remove from backend if user is logged in
        if (userProfile?.id && articleId) {
          await removeBookmarkApi(userProfile.id, articleId);
        }
        // Also remove from localStorage for backward compatibility
        const raw = localStorage.getItem("bookmarks");
        const existing = raw ? JSON.parse(raw) : [];
        const next = existing.filter((b) => b.title !== title);
        localStorage.setItem("bookmarks", JSON.stringify(next));
        
        setIsBookmarked(false);
        setBookmarkNote("");
        notify.success("Bookmark removed successfully");
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
        notify.error("Failed to remove bookmark");
      }
      return;
    }
    // Open themed modal for note entry when adding.
    setBookmarkNoteDraft(bookmarkNote || "");
    setShowBookmarkModal(true);
  };

  const finalizeBookmark = async () => {
    try {
      const noteText = bookmarkNoteDraft.trim();
      
      // Save to backend if user is logged in
      if (userProfile?.id && articleId) {
        const articleData = {
          id: articleId,
          title,
          summary,
          imageUrl,
          url: newsUrl,
          source,
          timestamp,
          category,
        };
        
        await addBookmark(userProfile.id, articleId, noteText, articleData);
      }
      
      // Also save to localStorage for backward compatibility
      const raw = localStorage.getItem("bookmarks");
      const existing = raw ? JSON.parse(raw) : [];
      const entry = {
        title,
        summary,
        imageUrl,
        newsUrl,
        source,
        timestamp,
        category,
        note: noteText,
        savedAt: Date.now(),
      };
      existing.push(entry);
      localStorage.setItem("bookmarks", JSON.stringify(existing));
      
      setIsBookmarked(true);
      setBookmarkNote(noteText);
      setShowBookmarkModal(false);
      notify.success(
        "Article bookmarked" + (noteText ? " with note" : " successfully")
      );
    } catch (error) {
      console.error("Failed to save bookmark:", error);
      notify.error("Failed to save bookmark");
      setShowBookmarkModal(false);
    }
  };

  const cancelBookmarkModal = () => {
    setShowBookmarkModal(false);
    setBookmarkNoteDraft("");
  };

  // --- RENDER --- Full-screen layout with overlay meta + action ribbon.
  const [imgError, setImgError] = useState(false);

  const resolvedImage =
    imageUrl && !imgError && !isBadImage(imageUrl) ? imageUrl : defaultImg;

  const gradientStyle = {
    background:
      "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
    boxShadow:
      "0 4px 12px -2px rgba(255,0,80,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)",
  };

  return (
    <article className="relative h-full w-full bg-gray-900 text-white flex items-center justify-center">
      {/* Background image (with fallback) */}
      <img
        src={resolvedImage}
        alt={title || "Article"}
        onError={() => {
          setImgError(true);
          if (imageUrl) markBadImage(imageUrl);
        }}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <span
        className="absolute top-10 left-6 text-white text-xs font-semibold px-3 py-1 rounded-full"
        style={gradientStyle}
      >
        {category}
      </span>

      <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 sm:pb-8 flex flex-col justify-end">
        <h2 className="font-serif mb-3 leading-snug text-[clamp(1.9rem,5vw,3rem)]">
          {isTranslated ? translatedContent.title : title}
        </h2>
        <p className="font-sans text-gray-200 text-base sm:text-lg mb-5">
          {isTranslated ? translatedContent.summary : summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-y-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="font-sans text-xs text-gray-400">
              <span className="font-semibold">{source}</span> •{" "}
              <span>{timestamp}</span>
            </div>
            {/* Timer display removed per request */}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBookmarkClick}
              className={`flex items-center gap-2 p-2.5 rounded-full backdrop-blur-sm transition-colors ${
                isBookmarked ? "" : "bg-white/10 hover:bg-white/20"
              }`}
              style={isBookmarked ? gradientStyle : undefined}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark
                size={18}
                className={isBookmarked ? "fill-white" : ""}
              />
            </button>
            <button
              onClick={onTranslateClick}
              disabled={isTranslating}
              className="flex items-center gap-2 p-2.5 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Translate news"
            >
              <Languages size={18} />
            </button>

            <button
              onClick={onListenClick}
              disabled={isFetchingAudio}
              className={`p-2.5 rounded-full backdrop-blur-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                isSpeaking ? "" : "bg-white/10 hover:bg-white/20"
              }`}
              style={isSpeaking ? gradientStyle : undefined}
              aria-label="Listen to news summary"
            >
              {isFetchingAudio ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : isSpeaking ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            <a
              href={newsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-semibold bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              Read More <SquareArrowOutUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {isLangSelectorOpen && (
        <LanguageSelector
          onSelectLanguage={onSelectLanguage}
          onClose={() => setIsLangSelectorOpen(false)}
        />
      )}

      {showBookmarkModal && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={cancelBookmarkModal}
        >
          <div
            className="relative w-full max-w-md mx-4 bg-gray-900 rounded-xl p-6 shadow-lg"
            style={{ border: "2px solid #ff1e4d" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bookmark size={18} /> Save Bookmark
              </h3>
              <button
                onClick={cancelBookmarkModal}
                className="text-gray-400 hover:text-red-400 transition"
                aria-label="Close bookmark modal"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Optional note (why you saved this):
            </p>
            <textarea
              value={bookmarkNoteDraft}
              onChange={(e) => setBookmarkNoteDraft(e.target.value)}
              rows={3}
              placeholder="e.g. Great insight on AI trends"
              className="w-full rounded-md bg-gray-800 border border-gray-700 focus:border-red-500 focus:ring-red-500 text-sm p-2 text-gray-200 placeholder-gray-500 resize-none"
              autoFocus
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={cancelBookmarkModal}
                className="px-4 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={finalizeBookmark}
                className="px-4 py-2 text-sm rounded-md text-white transition"
                style={gradientStyle}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// formatTime helper removed (not displayed anymore)
