// --- Imports ---
import React, { useState } from "react";
import {
    SquareArrowOutUpRight,
    Languages,
    Volume2,
    VolumeX,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";

/**
 * Renders a full-screen card for a single news article within the ReelView.
 * Includes interactive features like text-to-speech and on-demand translation.
 */
export default function ReelCard({
    title,
    summary,
    imageUrl,
    newsUrl,
    source,
    timestamp,
    category,
}) {
    // --- State Management ---
    const [isSpeaking, setIsSpeaking] = useState(false); // Tracks text-to-speech status.
    const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false); // Toggles the language choice modal.
    const [isTranslated, setIsTranslated] = useState(false); // Tracks if the content is showing a translation.
    const [translatedContent, setTranslatedContent] = useState({ title: "", summary: "" }); // Stores translated text.
    const [isTranslating, setIsTranslating] = useState(false); // Shows a loading state during the API call.

    // --- Handlers & Logic ---

    // Toggles text-to-speech, reading the translated summary if it's available.
    const handleListen = (e) => {
        e.stopPropagation(); // Prevents actions on the underlying container.
        const textToSpeak = isTranslated ? translatedContent.summary : (summary || title);

        if ("speechSynthesis" in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser does not support text-to-speech.");
        }
    };

    // If already translated, reverts to original. Otherwise, opens the language selector.
    const handleTranslateClick = (e) => {
        e.stopPropagation();
        if (isTranslated) {
            setIsTranslated(false); // Acts as a "Show Original" button.
        } else {
            setIsLangSelectorOpen(true);
        }
    };

    /**
     * Fetches translation from an API based on the selected language.
     * @param {string} targetLanguage - The language code (e.g., 'es', 'fr').
     */
    const performTranslation = async (targetLanguage) => {
        setIsLangSelectorOpen(false);
        setIsTranslating(true);

        try {
            const sourceLanguage = 'en';
            // Use Promise.all to fetch translations concurrently for better performance.
            const [titleResponse, summaryResponse] = await Promise.all([
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(title)}&langpair=${sourceLanguage}|${targetLanguage}`),
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(summary)}&langpair=${sourceLanguage}|${targetLanguage}`)
            ]);
            const titleData = await titleResponse.json();
            const summaryData = await summaryResponse.json();

            if (titleData.responseStatus === 200 && summaryData.responseStatus === 200) {
                setTranslatedContent({
                    title: titleData.responseData.translatedText,
                    summary: summaryData.responseData.translatedText,
                });
                setIsTranslated(true);
            } else {
                throw new Error("Translation API returned an error.");
            }
        } catch (error) {
            console.error("Translation API error:", error);
            alert("Sorry, we couldn't translate the content.");
        } finally {
            setIsTranslating(false); // Reset loading state regardless of outcome.
        }
    };

    // --- Render ---
    return (
        <article className="relative h-full w-full bg-gray-900 text-white flex items-center justify-center">
            {/* Background Image and Overlays */}
            {imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <span className="absolute top-20 left-6 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {category}
            </span>

            {/* Main Content Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 sm:pb-8 flex flex-col justify-end">
                {/* Conditionally display original or translated content */}
                <h2 className="font-serif text-2xl sm:text-3xl mb-2 leading-tight line-clamp-3">
                    {isTranslated ? translatedContent.title : title}
                </h2>
                <p className="font-sans text-gray-300 text-sm line-clamp-2 mb-4">
                    {isTranslated ? translatedContent.summary : summary}
                </p>

                {/* Action Buttons and Metadata */}
                <div className="mt-4 flex flex-wrap gap-y-3 justify-between items-center">
                    <div className="font-sans text-xs text-gray-400">
                        <span className="font-semibold">{source}</span> • <span>{timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTranslateClick}
                            disabled={isTranslating}
                            className="flex items-center gap-2 p-2.5 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                            aria-label="Translate news"
                        >
                            <Languages size={18} />
                        </button>

                        <button
                            onClick={handleListen}
                            className={`p-2.5 rounded-full backdrop-blur-sm transition-colors ${isSpeaking ? "bg-red-500/50 hover:bg-red-500/60" : "bg-white/10 hover:bg-white/20"
                                }`}
                            aria-label="Listen to news summary"
                        >
                            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
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

            {/* Conditionally render the language selector as an overlay. */}
            {isLangSelectorOpen && (
                <LanguageSelector
                    onSelectLanguage={performTranslation}
                    onClose={() => setIsLangSelectorOpen(false)}
                />
            )}
        </article>
    );
}