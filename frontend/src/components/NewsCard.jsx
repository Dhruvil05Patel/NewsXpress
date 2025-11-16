import React, { useState } from "react";
import {
  SquareArrowOutUpRight,
  Languages,
  Volume2,
  VolumeX,
  LoaderCircle,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useTranslation } from "../hooks/useTranslation";

export default function NewsCard({
  title,
  summary,
  imageUrl,
  newsUrl,
  source,
  timestamp,
  category,
  onCardClick,
  userProfile,
}) {
  // Local state for image error handling
  const [imgError, setImgError] = useState(false);

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

  const { isSpeaking, isFetchingAudio, handleListen } =
    useTextToSpeech(selectedLanguage);

  // Image error handler
  const handleImageError = () => setImgError(true);

  // Wrapper function to handle translate click event
  const onTranslateClick = (e) => {
    e.stopPropagation();
    handleTranslateClick();
  };

  // Wrapper for performTranslation with current title/summary
  const onSelectLanguage = (targetLanguage) => {
    performTranslation(title, summary, targetLanguage);
  };

  // Wrapper for handleListen with appropriate text
  const onListenClick = async (e) => {
    e.stopPropagation();
    const textToSpeak =
      (isTranslated ? translatedContent.summary : summary) ||
      (isTranslated ? translatedContent.title : title);
    await handleListen(textToSpeak);
  };

  return (
    <article
      onClick={onCardClick}
      className="relative w-full overflow-hidden rounded-lg shadow-md bg-gray-800 text-white cursor-pointer"
    >
      {/* Per-card profile header removed (profile shown in SideBar instead) */}
      {/* Conditionally render the image or a fallback UI if the image fails to load. */}
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-[70vh] max-h-[600px] object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-[70vh] max-h-[600px] bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center">
          <span className="text-gray-300 text-sm">Image Not Found</span>
        </div>
      )}

      {/* A dark gradient overlay to make the text readable over the image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

      {/* Category tag at the top-left corner. */}
      <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
        {category}
      </span>

      {/* Container for the text content and action buttons at the bottom. */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        {/* Display translated or original title. */}
        <h2 className="font-serif text-xl sm:text-2xl mb-2 leading-tight line-clamp-3">
          {isTranslated ? translatedContent.title : title}
        </h2>
        {/* Display translated or original summary. */}
        <p className="font-sans text-gray-300 text-sm md:text-base line-clamp-2 mb-4">
          {isTranslated ? translatedContent.summary : summary}
        </p>
        {/* News source and timestamp. */}
        <div className="font-sans text-xs text-gray-400 mb-3">
          <span className="font-semibold">{source}</span> •{" "}
          <span>{timestamp}</span>
        </div>

        {/* Container for action buttons. */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Translate Button
                    <button
                        onClick={onTranslateClick}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                        {isTranslating ? 'Translating...' : (isTranslated ? 'Show Original' : 'Translate')}
                        <Languages size={16} />
                    </button> */}

          {/* Listen Button
                    <button
                        onClick={onListenClick}
                        disabled={isFetchingAudio && !isSpeaking}
                        className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all backdrop-blur-sm disabled:opacity-70 disabled:cursor-not-allowed ${isSpeaking ? "bg-red-500/50 hover:bg-red-500/60" : "bg-white/10 hover:bg-white/20"}`}
                    >
                        {isFetchingAudio ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                Loading Audio...
                            </>
                        ) : isSpeaking ? (
                            <>
                                Stop Listening <VolumeX size={16} />
                            </>
                        ) : (
                            <>
                                Listen News <Volume2 size={16} />
                            </>
                        )}
                    </button> */}

          {/* Read More Link */}
          <a
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-all"
          >
            Read More <SquareArrowOutUpRight size={16} />
          </a>
        </div>
      </div>

      {/* Conditionally render the Language Selector modal when needed. */}
      {isLangSelectorOpen && (
        <LanguageSelector
          onSelectLanguage={onSelectLanguage}
          onClose={() => setIsLangSelectorOpen(false)}
        />
      )}
    </article>
  );
}
