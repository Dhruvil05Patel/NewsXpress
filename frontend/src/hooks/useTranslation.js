import { useState } from "react";
import notify from "../utils/toast";
import { handleTranslation } from "../services/translation-and-speech/translate";

/**
 * Custom hook to manage translation functionality
 * @returns {Object} - State and handlers for translation
 */
export const useTranslation = () => {
  // --- State Management ---
  // Controls the visibility of the language selection modal.
  const [isTranslated, setIsTranslated] = useState(false);
  // Stores the translated title and summary.
  const [translatedContent, setTranslatedContent] = useState({
    title: "",
    summary: "",
  });
  // Shows a loading state while the translation API is being called.
  const [isTranslating, setIsTranslating] = useState(false);
  // Tracks the selected Language
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  // Controls the visibility of the language selection modal.
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);

  /**
   * Toggles the translation state or opens the language selector.
   */
  const handleTranslateClick = () => {
    if (isTranslated) {
      // Revert to original text
      setIsTranslated(false);
    } else {
      // Show language selector
      setIsLangSelectorOpen(true);
    }
  };

  const performTranslation = async (title, summary, targetLanguage) => {
    setIsLangSelectorOpen(false);
    setIsTranslating(true);
    setSelectedLanguage(targetLanguage);

    try {
      // Translate title and summary simultaneously
      const [translatedTitle, translatedSummary] = await Promise.all([
        handleTranslation(title, targetLanguage),
        handleTranslation(summary, targetLanguage),
      ]);

      setTranslatedContent({
        title: translatedTitle,
        summary: translatedSummary,
      });
      setIsTranslated(true);
    } catch (error) {
      console.error("Translation failed:", error);
      notify.error("🚫 Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const resetTranslation = () => {
    setIsTranslated(false);
    setTranslatedContent({ title: "", summary: "" });
    setSelectedLanguage("en");
  };

  return {
    isTranslated,
    translatedContent,
    isTranslating,
    selectedLanguage,
    isLangSelectorOpen,
    setIsLangSelectorOpen,
    handleTranslateClick,
    performTranslation,
    resetTranslation,
  };
};
