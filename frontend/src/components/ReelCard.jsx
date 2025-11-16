import React, { useEffect, useState } from "react";
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
import notify from "../utils/toast";

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
  cardIndex,
}) {
  // Use custom hooks
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

  const { isSpeaking, isFetchingAudio, handleListen, audioPlayer } =
    useTextToSpeech(selectedLanguage);

  // Bookmark local state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNoteDraft, setBookmarkNoteDraft] = useState("");

  // Load existing bookmarks from localStorage to reflect state
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

  // Register this card's audio player in the parent ref array
  useEffect(() => {
    if (audioPlayersRef && audioPlayer) {
      audioPlayersRef.current[cardIndex] = audioPlayer;
    }
  }, [audioPlayersRef, audioPlayer, cardIndex]);

  // Stop TTS when card becomes inactive
  useEffect(() => {
    if (!isActive && isSpeaking && audioPlayer.current) {
      audioPlayer.current.pause();
      // Trigger handleListen to properly update state
      handleListen();
    }
  }, [isActive, isSpeaking, audioPlayer, handleListen]);

  // Wrapper function to handle click event
  const onTranslateClick = (e) => {
    e.stopPropagation();
    if (!userProfile) {
      notify.warn("🔒 Please login to use translation feature");
      return;
    }
    handleTranslateClick();
  };

  // Wrapper for performTranslation with current title/summary
  const onSelectLanguage = (targetLanguage) => {
    performTranslation(title, summary, targetLanguage);
  };

  // Wrapper for handleListen with appropriate text
  const onListenClick = async (e) => {
    e.stopPropagation();
    if (!userProfile) {
      notify.warn("🔒 Please login to use text-to-speech feature");
      return;
    }
    const textToSpeak =
      (isTranslated ? translatedContent.summary : summary) ||
      (isTranslated ? translatedContent.title : title);
    await handleListen(textToSpeak);
  };

  const onBookmarkClick = (e) => {
    e.stopPropagation();
    if (!userProfile) {
      notify.warn("🔒 Please login to bookmark articles");
      return;
    }

    // If already bookmarked, remove
    const raw = localStorage.getItem("bookmarks");
    const existing = raw ? JSON.parse(raw) : [];
    if (isBookmarked) {
      const next = existing.filter((b) => b.title !== title);
      localStorage.setItem("bookmarks", JSON.stringify(next));
      setIsBookmarked(false);
      setBookmarkNote("");
      notify.success("✅ Bookmark removed");
      return;
    }
    // Open themed modal for note entry
    setBookmarkNoteDraft(bookmarkNote || "");
    setShowBookmarkModal(true);
  };

  const finalizeBookmark = () => {
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
      note: bookmarkNoteDraft.trim(),
      savedAt: Date.now(),
    };
    existing.push(entry);
    localStorage.setItem("bookmarks", JSON.stringify(existing));
    setIsBookmarked(true);
    setBookmarkNote(bookmarkNoteDraft.trim());
    setShowBookmarkModal(false);
    notify.success(
      "🔖 Added to bookmarks" + (bookmarkNoteDraft.trim() ? " with note" : "")
    );
  };

  const cancelBookmarkModal = () => {
    setShowBookmarkModal(false);
    setBookmarkNoteDraft("");
  };

  // --- RENDER ---
  // This JSX is restored to the full-screen layout
  return (
    <article className="relative h-full w-full bg-gray-900 text-white flex items-center justify-center">
      {/* Per-card profile header removed (profile shown in SideBar instead) */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <span className="absolute top-20 left-6 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
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
          <div className="font-sans text-xs text-gray-400">
            <span className="font-semibold">{source}</span> •{" "}
            <span>{timestamp}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBookmarkClick}
              className={`flex items-center gap-2 p-2.5 rounded-full backdrop-blur-sm transition-colors ${
                isBookmarked
                  ? "bg-red-500/70 hover:bg-red-500/80"
                  : "bg-white/10 hover:bg-white/20"
              }`}
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
                isSpeaking
                  ? "bg-red-500/50 hover:bg-red-500/60"
                  : "bg-white/10 hover:bg-white/20"
              }`}
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
            className="relative w-full max-w-md mx-4 bg-gray-900 border border-red-600/40 rounded-xl p-6 shadow-lg"
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
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-500 transition"
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
