import { useState, useRef } from "react";
import { textToSpeech } from "../services/translation-and-speech/textToSpeech";
import notify from "../utils/toast";

/**
 * Custom hook to manage text-to-speech functionality
 * @param {string} selectedLanguage - The currently selected language code
 * @returns {Object} - State and handlers for TTS
 */
export const useTextToSpeech = (selectedLanguage) => {
  // Tracks if text-to-speech audio is currently playing.
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Shows a loading state while fetching audio from the Google TTS API.
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);

  // --- Refs ---
  // Holds a reference to the HTML <audio> element for playback control.
  const audioPlayer = useRef(null);
  // A flag to immediately stop audio playback if the user requests it.
  const cancelPlaybackRef = useRef(false);
  // AbortController to cancel ongoing fetch requests
  const abortControllerRef = useRef(null);

  /**
   * Handles the play/stop functionality for the text-to-speech feature.
   */
  const handleListen = async (textToSpeak) => {
    // If audio is already playing, stop it
    if (isSpeaking) {
      cancelPlaybackRef.current = true;
      if (audioPlayer.current) {
        audioPlayer.current.pause();
      }
      setIsSpeaking(false);
      setIsFetchingAudio(false);
      return;
    }

    // Reset cancellation flag for new playback
    cancelPlaybackRef.current = false;
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    if (textToSpeak) {
      try {
        await textToSpeech(
          textToSpeak,
          selectedLanguage,
          setIsFetchingAudio,
          setIsSpeaking,
          cancelPlaybackRef,
          audioPlayer,
          abortControllerRef.current
        );
      } catch (error) {
        // Don't show error if it was intentionally aborted
        if (error.name !== "AbortError") {
          notify.error(
            error.message || "Something went wrong while fetching audio."
          );
        }
      }
    } else {
      notify.warn("No content available to listen to");
    }
  };

  /**
   * Cleanup function to abort ongoing requests and stop playback
   */
  const cleanup = () => {
    // Abort any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Stop audio playback
    cancelPlaybackRef.current = true;
    if (audioPlayer.current) {
      audioPlayer.current.pause();
      audioPlayer.current = null;
    }
    // Reset states
    setIsSpeaking(false);
    setIsFetchingAudio(false);
  };

  return {
    isSpeaking,
    isFetchingAudio,
    handleListen,
    audioPlayer,
    cleanup,
  };
};
