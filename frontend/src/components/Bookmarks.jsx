// Bookmarks.jsx
// Displays saved bookmarks; uses server when logged in, localStorage fallback for guests.
import React, { useState, useEffect } from "react";
import {
  getBookmarksForProfile,
  addBookmark,
  removeBookmarkApi,
} from "../services/api"; // adjust path as needed
import notify from "../utils/toast";

// Helper to get profile from localStorage (or replace with context)
function getSavedProfile() {
  try {
    const raw = localStorage.getItem("currentProfile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Ensure each bookmark item has a unique `key` string for React lists
function normalizeLocalBookmarks(arr = []) {
  return arr.map((item, idx) => {
    const key =
      item.key || item.id || item.title || `${item.newsUrl || "item"}-${idx}`;
    return { ...item, key };
  });
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const profile = getSavedProfile(); // { id, full_name, username, ... } or null
  const profileId = profile?.id;

  // Update page title
  useEffect(() => {
    document.title = "Bookmarks | NewsXpress";
  }, []);

  // Load bookmarks (server if profile present, else local) on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      if (profileId) {
        try {
          const serverBookmarks = await getBookmarksForProfile(profileId);
          const normalized = serverBookmarks.map((b) => {
            const art = b.article || {};
            // Use interaction id (b.id) when available to make keys unique per bookmark
            const key = b.id ? `i-${b.id}` : `a-${b.article_id || b.id}`;
            return {
              key,
              id: b.article_id || b.id,
              title: art.title || art.headline || "Untitled",
              imageUrl: art.imageUrl || art.image_url || null,
              newsUrl: art.url || art.newsUrl || art.link || "#",
              source: art.source || art.publisher || "",
              timestamp: art.timestamp || b.bookmark_timestamp,
              note: b.note || "",
              interactionId: b.id,
            };
          });
          if (mounted) setBookmarks(normalized);
        } catch (err) {
          console.error("Failed to load bookmarks from server", err);
          notify.error("Could not load bookmarks — falling back to saved list");
          const raw = localStorage.getItem("bookmarks");
          const parsed = raw ? JSON.parse(raw) : [];
          setBookmarks(normalizeLocalBookmarks(parsed));
        }
      } else {
        try {
          const raw = localStorage.getItem("bookmarks");
          const parsed = raw ? JSON.parse(raw) : [];
          setBookmarks(normalizeLocalBookmarks(parsed));
        } catch {
          setBookmarks([]);
        }
      }
      if (mounted) setLoading(false);
    }
    load();
    return () => (mounted = false);
  }, [profileId]);

  const removeBookmark = async (keyOrArticleId) => {
    const item = bookmarks.find(
      (b) => b.key === keyOrArticleId || b.id === keyOrArticleId
    );
    if (!item) return;
    const next = bookmarks.filter(
      (b) => b.key !== keyOrArticleId && b.id !== keyOrArticleId
    );
    setBookmarks(next);
    if (profileId) {
      try {
        await removeBookmarkApi(profileId, item.id);
        notify.success("Bookmark removed");
      } catch (err) {
        console.error("remove bookmark failed", err);
        notify.error("Could not remove bookmark on server");
        setBookmarks(bookmarks);
      }
    } else {
      localStorage.setItem("bookmarks", JSON.stringify(next));
      notify.success("Bookmark removed");
    }
  };

  const saveNote = async (articleId, note) => {
    if (!profileId) {
      notify.info("Login to save notes with your bookmarks");
      return;
    }
    try {
      await addBookmark(profileId, articleId, note);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === articleId ? { ...b, note } : b))
      );
      notify.success("Note saved");
    } catch (err) {
      console.error("save note failed", err);
      notify.error("Could not save note");
    }
  };

  if (loading) {
    return (
      <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
        <div className="px-4 lg:px-10 py-12 w-full">
          <div className="w-full mx-auto">
            {/* Skeleton Header */}
            <div className="text-center mb-10">
              <div
                className="h-12 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded-lg mb-3 mx-auto max-w-md animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
              <div
                className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded mx-auto max-w-sm animate-pulse"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              ></div>
            </div>
            {/* Skeleton Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-md">
                  <div
                    className="h-64 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 animate-pulse"
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  ></div>
                  <div className="p-4 space-y-3">
                    <div
                      className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded w-3/4 animate-pulse"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    ></div>
                    <div
                      className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded animate-pulse"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    ></div>
                    <div
                      className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 rounded w-5/6 animate-pulse"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </main>
    );
  }

  if (!bookmarks.length) {
    return (
      <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
        <div className="px-4 lg:px-10 py-12 w-full">
          <div className="w-full mx-auto text-center">
            <h1 className="font-serif text-4xl font-bold mb-4">My Bookmarks</h1>
            <p className="text-stone-500">You have no saved articles yet.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-newspaper text-zinc-900 lg:ml-64 xl:mr-80 pt-24">
      <div className="px-4 lg:px-10 py-12 w-full">
        <div className="w-full mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold mb-2">My Bookmarks</h1>
            <p className="text-stone-600">Saved articles for later reading</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((item) => (
              <article
                key={item.key}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {item.imageUrl && (
                  <a
                    href={item.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-44 object-cover"
                    />
                  </a>
                )}
                <div className="p-4">
                  <a
                    href={item.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h3 className="font-semibold text-lg text-zinc-900 line-clamp-2">
                      {item.title}
                    </h3>
                  </a>
                  {item.source && (
                    <p className="text-sm text-stone-500 mt-2">
                      {item.source} • {item.timestamp}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <a
                      href={item.newsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white px-3 py-2 rounded-md"
                      style={{
                        background:
                          "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 40%,#ff0066 90%)",
                        boxShadow:
                          "0 4px 10px -2px rgba(255,0,80,0.4),0 2px 5px -1px rgba(0,0,0,0.25)",
                      }}
                    >
                      Read
                    </a>
                    <button
                      onClick={() => removeBookmark(item.key)}
                      className="text-sm px-3 py-2 rounded-md border"
                      style={{
                        color: "#ff1e4d",
                        borderColor: "#ff9fb3",
                        background:
                          "linear-gradient(135deg,#fff,#fff 60%,#ffe6ec)",
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Note UI */}
                  <div className="mt-3">
                    <textarea
                      placeholder="Add a private note..."
                      className="w-full border rounded-md p-2 text-sm"
                      defaultValue={item.note || ""}
                      onBlur={(e) => saveNote(item.id, e.target.value)}
                    />
                    <p className="text-xs text-stone-400 mt-1">
                      Notes are saved when the textbox loses focus.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
