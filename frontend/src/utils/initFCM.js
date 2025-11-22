/**
 * Initialize Firebase Cloud Messaging
 * - Registers service worker
 * - Sets up foreground message listener
 */
import { isSupported, getMessaging, onMessage } from "firebase/messaging";
import { app } from "../components/auth/firebase";

let initialized = false;

export async function initFCM() {
  if (initialized) return;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM: Not supported in this browser");
      return;
    }

    // Register service worker early
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js?v4" // query param to force update
        );
        console.log("✅ FCM: Service worker registered:", registration.scope);
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        // Unregister stale SWs without the ?v4 suffix
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          if (r.active && r.active.scriptURL.includes('firebase-messaging-sw.js') && !r.active.scriptURL.includes('v4')) {
            console.log('🧹 Unregistering old SW:', r.active.scriptURL);
            await r.unregister();
          }
        }
        console.log("✅ FCM: Service worker is ready");
      } catch (err) {
        console.error("❌ FCM: Service worker registration failed:", err);
        return;
      }
    }

    // Set up foreground message handler
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("📨 Foreground message received:", payload);

      const notificationTitle = payload.notification?.title || "New Notification";
      const notificationOptions = {
        body: payload.notification?.body || "",
        icon: payload.notification?.icon || "/favicon.ico",
        data: payload.data || {},
        requireInteraction: false,
        badge: "/favicon.ico",
      };

      // Show notification even when app is in foreground
      if (Notification.permission === "granted") {
        try {
          new Notification(notificationTitle, notificationOptions);
        } catch (err) {
          console.warn("⚠️ Failed to show notification:", err);
        }
      }
    });

    initialized = true;
    console.log("✅ FCM initialized successfully");
  } catch (err) {
    console.error("❌ FCM initialization failed:", err);
  }
}
