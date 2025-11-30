// CategoryOnboarding: choose notification categories + optionally capture FCM token
import { useMemo, useState, useEffect } from "react";
import { updateProfile } from "../services/api";
import { getFCMToken } from "../utils/getFCMToken";
import notify from "../utils/toast";

// Available categories
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
  const [saving, setSaving] = useState(false);
  const selectedSet = useMemo(
    () =>
      new Set(initialSelected && initialSelected.length ? initialSelected : []),
    [initialSelected]
  );
  const [selected, setSelected] = useState(Array.from(selectedSet));

  // Toggle selection
  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  // Save selections (lowercase + optional FCM token)
  const save = async () => {
    if (selected.length === 0) {
      notify.warn("Please select at least one category");
      return;
    }

    try {
      setSaving(true);

      // Convert categories to lowercase before sending to backend
      const lowercaseCategories = selected.map((cat) => cat.toLowerCase());
      const payload = { categories: lowercaseCategories };

      // Try to get FCM token (will request permission if needed)
      try {
        console.log("🔔 Requesting FCM token for notifications...");
        const token = await getFCMToken();
        if (token) {
          payload.fcm_token = token;
          console.log("FCM token acquired and will be saved");
          notify.success("Notification permissions granted");
        } else {
          console.warn("No FCM token available - notifications may not work");
          notify.info(
            "Notification permissions not granted. You can enable them later in settings"
          );
        }
      } catch (err) {
        console.warn("FCM token acquisition failed:", err);
        notify.warn(
          "Unable to enable notifications. You can enable them later"
        );
        // Continue anyway - categories will still be saved
      }

      console.log("📤 Saving profile with:", {
        categories: lowercaseCategories,
        hasToken: !!payload.fcm_token,
      });
      await updateProfile(profile.id, payload);
      console.log("✅ Profile updated successfully");

      notify.success("Preferences saved successfully");

      // Dispatch event so AuthContext can refresh
      window.dispatchEvent(new Event("profile-updated"));

      onClose && onClose(selected);
    } catch (e) {
      console.error("Failed to save categories:", e?.message || e);
      notify.error("Failed to save preferences. Please try again");
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
