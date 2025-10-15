// --- Imports ---
import React, { useState } from "react";
import {
    SquareArrowOutUpRight,
    Languages,
    Volume2,
    VolumeX,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector"; // A modal for choosing a language

/**
 * Displays a single news article with features like translation and text-to-speech.
 * It's designed to be a self-contained, interactive element.
 */
export default function NewsCard({
    title,
    summary,
    imageUrl,
    newsUrl,
    source,
    timestamp,
    category,
    onCardClick, // Function to trigger a full-screen view
}) {
    // --- State Management ---
    const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false); // Manages language selector visibility.
    const [imgError, setImgError] = useState(false); // Tracks if the image failed to load.
    const [isSpeaking, setIsSpeaking] = useState(false); // Tracks if text-to-speech is active.
    const [isTranslated, setIsTranslated] = useState(false); // Tracks if content is translated.
    const [translatedContent, setTranslatedContent] = useState({ title: "", summary: "" }); // Stores translated text.
    const [isTranslating, setIsTranslating] = useState(false); // Tracks if translation is in progress.

    // --- Handlers & Logic ---

    // Sets an error state if the article's image fails to load.
    const handleImageError = () => setImgError(true);

    // Toggles text-to-speech for the article summary.
    const handleListen = (e) => {
        e.stopPropagation(); // Prevent card's onCardClick from firing.
        const textToSpeak = isTranslated ? translatedContent.summary : summary;
        if ("speechSynthesis" in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(textToSpeak || title);
            utterance.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser does not support text-to-speech.");
        }
    };

    // If already translated, reverts to original text. Otherwise, opens the language selector.
    const handleTranslateClick = (e) => {
        e.stopPropagation();
        if (isTranslated) {
            setIsTranslated(false);
        } else {
            setIsLangSelectorOpen(true);
        }
    };

    /**
     * Performs the translation by calling an external API with the chosen language.
     * @param {string} targetLanguage - The language code (e.g., 'es', 'fr').
     */
    const performTranslation = async (targetLanguage) => {
        setIsLangSelectorOpen(false); // Close the selector UI.
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
            setIsTranslating(false); // Reset loading state regardless of success or failure.
        }
    };

    // --- Render ---
    return (
        <article
            onClick={onCardClick}
            className="relative w-full overflow-hidden rounded-none sm:rounded-lg shadow-md bg-gray-800 text-white cursor-pointer"
        >
            {/* Conditionally render the image or a fallback div on error. */}
            {imageUrl && !imgError ? (
                <img src={imageUrl} alt={title} className="w-full h-[70vh] max-h-[600px] object-cover" onError={handleImageError} />
            ) : (
                <div className="w-full h-[70vh] max-h-[600px] bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center">
                    <span className="text-gray-300 text-sm">Image Not Found</span>
                </div>
            )}

            {/* Overlays for styling and content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {category}
            </span>

            {/* Content and Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                {/* Display translated or original content based on state. */}
                <h2 className="font-serif text-xl sm:text-2xl mb-2 leading-tight line-clamp-3">
                    {isTranslated ? translatedContent.title : title}
                </h2>
                <p className="font-sans text-gray-300 text-sm md:text-base line-clamp-2 mb-4">
                    {isTranslated ? translatedContent.summary : summary}
                </p>
                <div className="font-sans text-xs text-gray-400 mb-3">
                    <span className="font-semibold">{source}</span> • <span>{timestamp}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleTranslateClick}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                        {isTranslating ? 'Translating...' : (isTranslated ? 'Show Original' : 'Translate')}
                        <Languages size={16} />
                    </button>

                    <button
                        onClick={handleListen}
                        className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all backdrop-blur-sm ${isSpeaking ? "bg-red-500/50 hover:bg-red-500/60" : "bg-white/10 hover:bg-white/20"
                            }`}
                    >
                        {isSpeaking ? (<>Stop Listening <VolumeX size={16} /></>) : (<>Listen News <Volume2 size={16} /></>)}
                    </button>

                    <a
                        href={newsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // Prevent card's onClick
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-all"
                    >
                        Read More <SquareArrowOutUpRight size={16} />
                    </a>
                </div>
            </div>

            {/* Conditionally render the LanguageSelector modal on top of the card. */}
            {isLangSelectorOpen && (
                <LanguageSelector
                    onSelectLanguage={performTranslation}
                    onClose={() => setIsLangSelectorOpen(false)}
                />
            )}
        </article>
    );
}