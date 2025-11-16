import { useMemo, useState, useEffect } from "react";
import api from "../services/api";
import { getFCMToken } from "../utils/getFCMToken";

const DEFAULT_CATEGORIES = [
  "Technology",
  "Business",
  "Science",
  "Sports",
  "Environment",
  "Politics",
  "Health",
  "Entertainment",
  "Crime",
];

export default function CategoryOnboarding({
  profile,
  onClose,
  initialSelected,
}) {
  // Register the Firebase Messaging service worker when this component mounts
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);
          })
          .catch((err) => {
            console.error("SW registration failed:", err);
          });
      };
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad, { once: true });
        return () => window.removeEventListener("load", onLoad);
      }
    }
  }, []);
  const [saving, setSaving] = useState(false);
  const selectedSet = useMemo(
    () => new Set(initialSelected && initialSelected.length ? initialSelected : []),
    [initialSelected]
  );
  const [selected, setSelected] = useState(Array.from(selectedSet));

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const save = async () => {
    try {
      setSaving(true);
      // Convert categories to lowercase before sending to backend
      const lowercaseCategories = selected.map(cat => cat.toLowerCase());
      const payload = { categories: lowercaseCategories };
      try {
        const token = await getFCMToken();
        if (token) payload.fcm_token = token;
      } catch {}
      await api.put(`/api/profiles/${profile.id}`, payload);
      onClose && onClose(selected);
    } catch (e) {
      console.error("Failed to save categories:", e?.message || e);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "min(640px, 92vw)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>
          Choose your notification categories
        </h2>
        <p style={{ color: "#666", marginBottom: 16 }}>
          We’ll send push notifications for the topics you care about.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {DEFAULT_CATEGORIES.map((name) => {
            const checked = selected.includes(name);
            return (
              <label
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 10,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: checked ? "#f0f9ff" : "#fff",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(name)}
                />
                <span>{name}</span>
              </label>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={() => onClose && onClose(null)}
            style={{
              padding: "10px 16px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
            disabled={saving}
          >
            Skip
          </button>
          <button
            onClick={save}
            style={{
              padding: "10px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
