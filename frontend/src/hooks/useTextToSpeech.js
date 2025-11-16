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

    if (textToSpeak) {
      try {
        await textToSpeech(
          textToSpeak,
          selectedLanguage,
          setIsFetchingAudio,
          setIsSpeaking,
          cancelPlaybackRef,
          audioPlayer
        );
      } catch (error) {
        notify.error(
          error.message || "Something went wrong while fetching audio."
        );
      }
    } else {
      notify.warn("🔊 No content available to listen to");
    }
  };

  return {
    isSpeaking,
    isFetchingAudio,
    handleListen,
    audioPlayer,
  };
};
