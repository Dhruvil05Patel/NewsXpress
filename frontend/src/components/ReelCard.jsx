import React from "react";
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

export default function ReelCard({
    title,
    summary,
    imageUrl,
    newsUrl,
    source,
    timestamp,
    category,
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

    const { isSpeaking, isFetchingAudio, handleListen } =
        useTextToSpeech(selectedLanguage);

    // Wrapper function to handle click event
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

    // --- RENDER ---
    // This JSX is restored to the full-screen layout
    return (
        <article className="relative h-full w-full bg-gray-900 text-white flex items-center justify-center">
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
                <h2 className="font-serif text-2xl sm:text-3xl mb-2 leading-tight line-clamp-3">
                    {isTranslated ? translatedContent.title : title}
                </h2>
                <p className="font-sans text-gray-300 text-sm line-clamp-2 mb-4">
                    {isTranslated ? translatedContent.summary : summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-y-3 justify-between items-center">
                    <div className="font-sans text-xs text-gray-400">
                        <span className="font-semibold">{source}</span> •{" "}
                        <span>{timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3">
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
        </article>
    );
}