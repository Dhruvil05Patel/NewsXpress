// In-memory + persistent cache of image URLs that failed to load.
// Used to prevent repeated network errors when components remount.

export const badImageCache = new Set();

(function loadFromStorage() {
  try {
    const raw = localStorage.getItem("badImages");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach((u) => badImageCache.add(u));
    }
  } catch {
    // ignore
  }
})();

export function isBadImage(url) {
  return !!(url && badImageCache.has(url));
}

export function markBadImage(url) {
  if (!url) return;
  if (!badImageCache.has(url)) badImageCache.add(url);
  try {
    const raw = localStorage.getItem("badImages");
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(url)) {
      arr.push(url);
      localStorage.setItem("badImages", JSON.stringify(arr));
    }
  } catch {
    // ignore
  }
}
