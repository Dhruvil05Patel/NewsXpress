// --- Imports ---
import React, { useState } from 'react';
import { languages } from '../utils/languages'; // A predefined list of languages
import { X } from 'lucide-react';      // Icon for the close button

/**
 * A modal component that allows users to search for and select a language.
 * @param {object} props - The component's properties.
 * @param {Function} props.onSelectLanguage - Callback function triggered with the selected language code.
 * @param {Function} props.onClose - Callback function to close the modal.
 */
export default function LanguageSelector({ onSelectLanguage, onClose }) {
    // --- State Management ---
    // State to hold the user's input from the search box.
    const [searchTerm, setSearchTerm] = useState('');

    // --- Logic ---
    // Filter the master language list based on the current search term.
    const filteredLanguages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Render ---
    return (
        // Main overlay. Clicking this area will close the modal.
        <div
            className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center"
            onClick={onClose}
        >
            {/* Modal content. Clicking inside this box will NOT close the modal. */}
            <div
                className="bg-gray-800 rounded-lg shadow-xl w-72 max-h-[60vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevents clicks from bubbling up to the overlay.
            >
                {/* Header with Title and Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">
                        Translate To
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        aria-label="Close language selector"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input Field */}
                <div className="p-2 border-b border-gray-700">
                    <input
                        type="text"
                        placeholder="Search for a language..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Scrollable List of Languages */}
                <ul className="flex-grow overflow-y-auto">
                    {filteredLanguages.length > 0 ? (
                        // Map over the filtered list to display each language as a button.
                        filteredLanguages.map(lang => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => onSelectLanguage(lang.code)}
                                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))
                    ) : (
                        // Display a message if no languages match the search term.
                        <li className="px-4 py-3 text-gray-500">No language found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}