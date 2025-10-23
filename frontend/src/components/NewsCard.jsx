// --- Imports ---
// Import React hooks for state and references.
import React, { useState, useRef } from "react";
// Import icons from the lucide-react library for the UI.
import {
    SquareArrowOutUpRight,
    Languages,
    Volume2,
    VolumeX,
    LoaderCircle,
} from "lucide-react";
// Import a custom component for language selection.
import LanguageSelector from "./LanguageSelector";
import { handleTranslation } from "../services/translation-and-speech/translate";
import {textToSpeech} from "../services/translation-and-speech/textToSpeech"


// --- Helper function to chunk text for the ElevenLabs API ---
/**
 * Splits a long text into smaller chunks based on sentence endings.
 * This is necessary because the ElevenLabs API has a character limit per request.
 * @param {string} text - The full text to be chunked.
 * @param {number} [limit=2500] - The maximum character length for each chunk.
 * @returns {string[]} An array of text chunks.
 */
const chunkText = (text, limit = 2500) => {
    // Return an empty array if there's no text.
    if (!text) return [];
    // Split text into sentences for cleaner breaks.
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = "";

    // Loop through each sentence to build chunks.
    for (const sentence of sentences) {
        // If adding the next sentence exceeds the limit, push the current chunk.
        if (currentChunk.length + sentence.length > limit) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence; // Start a new chunk with the current sentence.
        } else {
            // Otherwise, add the sentence to the current chunk.
            currentChunk += ` ${sentence.trim()}`;
        }
    }

    // Add the last remaining chunk to the array.
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};


/**
 * A UI component that displays a single news article with features like
 * translation and text-to-speech.
 */
export default function NewsCard({
    title,
    summary,
    imageUrl,
    newsUrl,
    source,
    timestamp,
    category,
    onCardClick,
}) {
    // --- State Management ---
    // Manages the visibility of the language selection modal.
    const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
    // Tracks if the article's main image failed to load.
    const [imgError, setImgError] = useState(false);
    // Tracks if the audio is currently playing.
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Tracks if the content has been translated.
    const [isTranslated, setIsTranslated] = useState(false);
    // Stores the translated title and summary.
    const [translatedContent, setTranslatedContent] = useState({ title: "", summary: "" });
    // Tracks if the translation API call is in progress.
    const [isTranslating, setIsTranslating] = useState(false);
    // Tracks if the audio is being fetched from the API.
    const [isFetchingAudio, setIsFetchingAudio] = useState(false);
    // Tracks the selected Language
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    
    // --- Refs ---
    // Holds the HTML <audio> element to control playback.
    const audioPlayer = useRef(null);
    // A flag to signal immediate cancellation of ongoing audio playback.
    const cancelPlaybackRef = useRef(false);


    // --- Handlers & Logic ---

    /**
     * Sets the image error state to true, causing a fallback UI to render.
     */
    const handleImageError = () => setImgError(true);

    /**
     * Handles the play/stop logic for the text-to-speech feature.
     */
    const handleListen = async (e) => {
        e.stopPropagation(); // Prevents the card's onCardClick from firing.
        
        // Determine which text to speak: translated or original.
        const textToSpeak = (isTranslated ? translatedContent.summary : summary) || (isTranslated ? translatedContent.title : title);

        // If audio is already playing, stop it.
        if (isSpeaking) {
            cancelPlaybackRef.current = true; // Signal to stop the speaking loop.
            if (audioPlayer.current) {
                audioPlayer.current.pause(); // Pause the current audio element.
            }
            setIsSpeaking(false);
            setIsFetchingAudio(false);
            return;
        }

        // Reset cancellation flag for a new playback session.
        cancelPlaybackRef.current = false;

        // If there's text, use the ElevenLabs API to generate and play audio.
        if (textToSpeak) {
            await textToSpeech(
                textToSpeak,
                selectedLanguage,
                setIsFetchingAudio,
                setIsSpeaking,
                cancelPlaybackRef,
                audioPlayer
            );
        } else {
            alert("Sorry, there is no content to listen to.");
        }
    };
    

    /**
     * Handles clicks on the "Translate" button. It either reverts to the
     * original text or opens the language selector.
     */
    const handleTranslateClick = (e) => {
        e.stopPropagation(); // Prevent card click.
        if (isTranslated) {
            setIsTranslated(false); // If already translated, show original.
        } else {
            setIsLangSelectorOpen(true); // Otherwise, open language picker.
        }
    };

    const performTranslation = async (targetLanguage) => {
        setIsLangSelectorOpen(false);
        setIsTranslating(true);
        setSelectedLanguage(targetLanguage);
     
        try {
            // Translate title and summary simultaneously
            const [translatedTitle, translatedSummary] = await Promise.all([
            await handleTranslation(title, targetLanguage),
            await handleTranslation(summary, targetLanguage),
            ]);

            setTranslatedContent({
                title: translatedTitle,
                summary: translatedSummary,
            });
            setIsTranslated(true);
        } catch (error) {
            console.error('Translation failed:', error);
            alert('Sorry, translation failed.');
        } finally {
            setIsTranslating(false);
        }
        };


    // --- Render ---
    // The JSX that defines the component's appearance.
    return (
        <article
            onClick={onCardClick}
            className="relative w-full overflow-hidden rounded-none sm:rounded-lg shadow-md bg-gray-800 text-white cursor-pointer"
        >
            {/* Conditionally render the image or a fallback UI if the image fails to load. */}
            {imageUrl && !imgError ? (
                <img src={imageUrl} alt={title} className="w-full h-[70vh] max-h-[600px] object-cover" onError={handleImageError} />
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
                    <span className="font-semibold">{source}</span> • <span>{timestamp}</span>
                </div>

                {/* Container for action buttons. */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Translate Button */}
                    <button
                        onClick={handleTranslateClick}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                        {isTranslating ? 'Translating...' : (isTranslated ? 'Show Original' : 'Translate')}
                        <Languages size={16} />
                    </button>

                    {/* Listen Button */}
                    <button
                        onClick={handleListen}
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
                    </button>

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
                    onSelectLanguage={performTranslation}
                    onClose={() => setIsLangSelectorOpen(false)}
                />
            )}
        </article>
    );
}