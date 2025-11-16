export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  try {
    if (Notification.permission === "granted") return "granted";
    const result = await Notification.requestPermission();
    return result; // "granted" | "denied" | "default"
  } catch (e) {
    console.warn("Notification permission request failed:", e?.message || e);
    return "error";
  }
}
