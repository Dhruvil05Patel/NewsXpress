import React from "react";
import defaultImg from "./Default.png"; // Fallback image
// NewsCard: compact article preview used in grid feeds.
// Props: title, summary (truncated intentionally), imageUrl, newsUrl (external),
// source + timestamp meta, category tag, and optional onCardClick handler.
// Images gracefully fallback; text overlay uses gradient for readability.
import { SquareArrowOutUpRight } from "lucide-react";
import { isBadImage, markBadImage } from "../utils/badImageCache";

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
  const [imgError, setImgError] = React.useState(false);
  const handleImageError = () => {
    setImgError(true);
    if (imageUrl) markBadImage(imageUrl);
  };

  // Truncate helper: limits by word count and appends an ellipsis.
  const truncateWords = (text, count) => {
    if (!text) return "";
    const words = String(text).trim().split(/\s+/);
    if (words.length <= count) return text;
    return words.slice(0, count).join(" ") + "…";
  };

  // Adjusted word counts chosen for concise scanning without losing context.
  const titleShort = truncateWords(title, 9);
  const summaryShort = truncateWords(summary, 20);

  // Inline gradient style for category badge & primary red accents
  const gradientStyle = {
    background:
      "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
    boxShadow:
      "0 4px 12px -2px rgba(255,0,80,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)",
  };

  return (
    <article
      onClick={onCardClick}
      className="relative w-full overflow-hidden rounded-lg shadow-md bg-gray-800 text-white cursor-pointer"
    >
      {/* Per-card profile header removed (profile shown in SideBar instead) */}
      {/* Conditionally render the image or a fallback UI if the image fails to load. */}
      <img
        src={
          imageUrl && !imgError && !isBadImage(imageUrl) ? imageUrl : defaultImg
        }
        alt={title || "Article"}
        className="w-full h-[70vh] max-h-[600px] object-cover"
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />

      {/* A dark gradient overlay to make the text readable over the image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

      {/* Category tag at the top-left corner. */}
      <span
        className="absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1 rounded-full"
        style={gradientStyle}
      >
        {category}
      </span>

      {/* Container for the text content and action buttons at the bottom. */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        {/* Display translated or original title. */}
        <h2 className="font-serif text-xl sm:text-2xl mb-2 leading-tight">
          {titleShort}
        </h2>
        {/* Display translated or original summary. */}
        <p className="font-sans text-gray-300 text-sm md:text-base mb-4">
          {summaryShort}
        </p>
        {/* News source and timestamp. */}
        <div className="font-sans text-xs text-gray-400 mb-3">
          <span className="font-semibold">{source}</span> •{" "}
          <span>{timestamp}</span>
        </div>

        {/* Container for action buttons. */}
        <div className="flex flex-wrap items-center gap-3">
          {/* (Removed translate & listen features as unused) */}

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

      {/* Translation modal removed */}
    </article>
  );
}
