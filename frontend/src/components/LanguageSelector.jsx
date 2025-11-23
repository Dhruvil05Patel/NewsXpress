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
        className="rounded-lg shadow-xl w-72 max-h-[60vh] flex flex-col"
        style={{
          background:
            "linear-gradient(145deg,#1f1f22 0%,#2a0a12 40%,#3a001d 70%)",
          border: "1px solid #ff294f",
          boxShadow:
            "0 8px 24px -6px rgba(255,0,80,0.45),0 4px 10px -3px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div
          className="flex items-center justify-between p-4"
          style={{
            background:
              "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
            borderBottom: "1px solid #ff5c7a",
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
          }}
        >
          <h3 className="text-lg font-semibold text-white tracking-wide">
            Select Language
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{
              background: "linear-gradient(135deg,#2c2c30,#26262a)",
              color: "#fff",
              border: "1px solid #ff3d60",
              boxShadow: "0 0 0 3px rgba(255,29,80,0.15)",
            }}
            placeholder="Search languages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(255,29,80,0.35)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(255,29,80,0.15)";
            }}
          />
        </div>

        <ul
          className="flex-grow overflow-y-auto p-2"
          style={{ scrollbarWidth: "thin" }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {filteredLanguages.map((lang) => (
            <li key={lang.code} className="py-1">
              <button
                onClick={() => onSelectLanguage(lang.code)}
                className="w-full text-left px-3 py-2 rounded text-sm font-medium transition"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg,#ff1e1e,#ff4d4d,#ff0066)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 10px -2px rgba(255,0,80,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
