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

  const gradientStyle = {
    background:
      "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
    boxShadow:
      "0 4px 12px -2px rgba(255,0,80,0.35), 0 2px 5px -1px rgba(0,0,0,0.25)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          width: "min(640px, 92vw)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          animation:
            "fadeInScale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 8,
            color: "#1f2937",
          }}
        >
          Choose your{" "}
          <span style={{ color: "#d32f2f" }}>notification categories</span>
        </h2>
        <p style={{ color: "#6b7280", marginBottom: 24, fontSize: "14px" }}>
          Select the topics you'd like to receive notifications about.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 24,
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
                  padding: "12px 14px",
                  border: checked ? "2px solid #d32f2f" : "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: checked ? "rgba(211, 47, 47, 0.08)" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontWeight: checked ? "500" : "400",
                  color: checked ? "#d32f2f" : "#374151",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(name)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "#d32f2f",
                  }}
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
              padding: "12px 20px",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              transition: "all 0.2s ease",
            }}
            disabled={saving}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            style={{
              ...gradientStyle,
              padding: "12px 24px",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: saving ? 0.7 : 1,
              transition: "all 0.2s ease",
              letterSpacing: "0.3px",
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
