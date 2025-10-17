// --- Imports ---
// Import React hooks for managing state and references.
import React, { useState, useRef } from "react";
// Import icons for the UI from the lucide-react library.
import {
    SquareArrowOutUpRight,
    Languages,
    Volume2,
    VolumeX,
    LoaderCircle,
} from "lucide-react";
// Import the custom LanguageSelector component.
import LanguageSelector from "./LanguageSelector";


// --- Helper function to chunk text for the ElevenLabs API ---
/**
 * Splits text into smaller parts to comply with API character limits.
 * @param {string} text - The text to be split.
 * @param {number} [limit=2500] - The maximum character limit for each chunk.
 * @returns {string[]} An array of text chunks.
 */
const chunkText = (text, limit = 2500) => {
    if (!text) return [];
    // Split text by sentences for more natural breaks.
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = "";

    // Loop through sentences and group them into chunks under the limit.
    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > limit) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence; // Start a new chunk.
        } else {
            currentChunk += ` ${sentence.trim()}`;
        }
    }

    // Add the final chunk if it exists.
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};


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
    // Controls the visibility of the language selection modal.
    const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
    // Tracks if text-to-speech audio is currently playing.
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Tracks whether the news content is currently displayed in a translated version.
    const [isTranslated, setIsTranslated] = useState(false);
    // Stores the translated title and summary.
    const [translatedContent, setTranslatedContent] = useState({ title: "", summary: "" });
    // Shows a loading state while the translation API is being called.
    const [isTranslating, setIsTranslating] = useState(false);
    // Shows a loading state while fetching audio from the ElevenLabs API.
    const [isFetchingAudio, setIsFetchingAudio] = useState(false);
    
    // --- Refs ---
    // Holds a reference to the HTML <audio> element for playback control.
    const audioPlayer = useRef(null);
    // A flag to immediately stop audio playback if the user requests it.
    const cancelPlaybackRef = useRef(false);


    /**
     * Handles the play/stop functionality for the text-to-speech feature.
     */
    const handleListen = async (e) => {
        e.stopPropagation(); // Prevents clicks from bubbling up to parent elements.
        
        // Select the appropriate text to speak (translated or original).
        const textToSpeak = (isTranslated ? translatedContent.summary : summary) || (isTranslated ? translatedContent.title : title);

        // If audio is already playing, stop it immediately.
        if (isSpeaking) {
            cancelPlaybackRef.current = true; // Set the flag to stop the audio loop.
            if (audioPlayer.current) {
                audioPlayer.current.pause(); // Pause the currently playing audio.
            }
            // Reset audio-related states.
            setIsSpeaking(false);
            setIsFetchingAudio(false);
            return;
        }

        // Reset the cancellation flag for a new playback session.
        cancelPlaybackRef.current = false;

        // If there is text content, start the text-to-speech process.
        if (textToSpeak) {
            await speakWithElevenLabs(textToSpeak);
        } else {
            alert("Sorry, there is no content to listen to.");
        }
    };

    /**
     * Manages fetching audio from the ElevenLabs API and playing it chunk by chunk.
     * @param {string} text - The text to be converted to speech.
     */
    const speakWithElevenLabs = async (text) => {
        // --- API Configuration ---
        const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Pre-selected voice ('Adam').
        const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

        if (!API_KEY) {
            alert("ElevenLabs API key is not configured.");
            return;
        }

        // Update UI to indicate audio is loading and playing.
        setIsFetchingAudio(true);
        setIsSpeaking(true);

        // Break the text into smaller pieces for the API.
        const textChunks = chunkText(text);

        // Process and play each chunk of text sequentially.
        for (const chunk of textChunks) {
            // Check if the user has requested to stop playback.
            if (cancelPlaybackRef.current) break;

            try {
                // Call the ElevenLabs text-to-speech API.
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': API_KEY,
                    },
                    body: JSON.stringify({
                        text: chunk,
                        model_id: 'eleven_multilingual_v2', // Use the multilingual model for better language support.
                    }),
                });

                if (!response.ok) throw new Error("Failed to fetch audio from ElevenLabs.");

                // Create a playable audio object from the API response.
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayer.current = new Audio(audioUrl);
                setIsFetchingAudio(false); // Hide the loader for this chunk.

                // Play the audio and wait for it to finish before the next chunk.
                await new Promise((resolve) => {
                    audioPlayer.current.onended = resolve;
                    audioPlayer.current.play();
                });

                // Clean up the generated URL to free up memory.
                URL.revokeObjectURL(audioUrl);

            } catch (error) {
                console.error("ElevenLabs API Error:", error);
                alert("Sorry, we couldn't play the audio.");
                break; // Exit the loop on error.
            }
        }

        // Reset all states after playback finishes or is cancelled.
        setIsSpeaking(false);
        setIsFetchingAudio(false);
        cancelPlaybackRef.current = false;
    };

    /**
     * Toggles the translation state or opens the language selector.
     */
    const handleTranslateClick = (e) => {
        e.stopPropagation();
        // If already translated, revert to the original text.
        if (isTranslated) {
            setIsTranslated(false);
        } else {
            // Otherwise, show the language selection modal.
            setIsLangSelectorOpen(true);
        }
    };

    /**
     * Fetches translated text from an API for a selected language.
     * @param {string} targetLanguage - The language code to translate to (e.g., 'es').
     */
    const performTranslation = async (targetLanguage) => {
        setIsLangSelectorOpen(false);
        setIsTranslating(true); // Show a loading indicator.
        try {
            const sourceLanguage = 'en';
            // Fetch translations for title and summary in parallel for efficiency.
            const [titleResponse, summaryResponse] = await Promise.all([
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(title)}&langpair=${sourceLanguage}|${targetLanguage}`),
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(summary)}&langpair=${sourceLanguage}|${targetLanguage}`)
            ]);
            const titleData = await titleResponse.json();
            const summaryData = await summaryResponse.json();

            // If the translation was successful, update the state.
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
            setIsTranslating(false); // Hide the loading indicator.
        }
    };


    // --- Render ---
    // This is the JSX that defines the component's UI.
    return (
        <article className="relative h-full w-full bg-gray-900 text-white flex items-center justify-center">
            {/* Background image */}
            {imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-cover" />}
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            {/* Category label */}
            <span className="absolute top-20 left-6 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {category}
            </span>

            {/* Main content area at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 sm:pb-8 flex flex-col justify-end">
                {/* News title (shows original or translated) */}
                <h2 className="font-serif text-2xl sm:text-3xl mb-2 leading-tight line-clamp-3">
                    {isTranslated ? translatedContent.title : title}
                </h2>
                {/* News summary (shows original or translated) */}
                <p className="font-sans text-gray-300 text-sm line-clamp-2 mb-4">
                    {isTranslated ? translatedContent.summary : summary}
                </p>

                {/* Container for metadata and action buttons */}
                <div className="mt-4 flex flex-wrap gap-y-3 justify-between items-center">
                    {/* Source and timestamp */}
                    <div className="font-sans text-xs text-gray-400">
                        <span className="font-semibold">{source}</span> • <span>{timestamp}</span>
                    </div>

                    {/* Action buttons (Translate, Listen, Read More) */}
                    <div className="flex items-center gap-3">
                        {/* Translate Button */}
                        <button
                            onClick={handleTranslateClick}
                            disabled={isTranslating}
                            className="flex items-center gap-2 p-2.5 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                            aria-label="Translate news"
                        >
                            <Languages size={18} />
                        </button>

                        {/* Listen Button (shows different icons based on state) */}
                        <button
                            onClick={handleListen}
                            disabled={isFetchingAudio}
                            className={`p-2.5 rounded-full backdrop-blur-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${isSpeaking ? "bg-red-500/50 hover:bg-red-500/60" : "bg-white/10 hover:bg-white/20"}`}
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

                        {/* Read More Link */}
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

            {/* Language Selector Modal (only rendered when open) */}
            {isLangSelectorOpen && (
                <LanguageSelector
                    onSelectLanguage={performTranslation}
                    onClose={() => setIsLangSelectorOpen(false)}
                />
            )}
        </article>
    );
}