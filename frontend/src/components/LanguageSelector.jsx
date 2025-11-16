// --- Imports ---
import React, { useState } from "react";
import { languages } from "../utils/languages"; // A predefined list of languages
import { X } from "lucide-react"; // Icon for the close button

/**
 * A modal component that allows users to search for and select a language.
 * @param {object} props - The component's properties.
 * @param {Function} props.onSelectLanguage - Callback function triggered with the selected language code.
 * @param {Function} props.onClose - Callback function to close the modal.
 */
export default function LanguageSelector({ onSelectLanguage, onClose }) {
  // --- State Management ---
  // State to hold the user's input from the search box.
  const [searchTerm, setSearchTerm] = useState("");

  // --- Logic ---
  // Filter the master language list based on the current search term.
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render ---
  return (
    // Main overlay. Clicking this area will close the modal.
    <div
      className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onWheel={(e) => {
        // prevent wheel from bubbling to underlying reel when modal is open
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Modal content. Clicking inside this box will NOT close the modal. */}
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-72 max-h-[60vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevents clicks from bubbling up to the overlay.
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Select language</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            className="w-full px-2 py-1 rounded bg-gray-700 text-sm"
            placeholder="Search languages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ul
          className="flex-grow overflow-y-auto p-4"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {filteredLanguages.map((lang) => (
            <li key={lang.code} className="py-2">
              <button
                onClick={() => onSelectLanguage(lang.code)}
                className="w-full text-left hover:bg-gray-700 px-2 py-1 rounded"
              >
                {lang.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
