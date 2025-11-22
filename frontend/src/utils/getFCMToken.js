import { isSupported, getMessaging, getToken } from "firebase/messaging";
import { app } from "../components/auth/firebase";

export async function getFCMToken() {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM: Messaging not supported in this browser.");
      return null;
    }

    // Request notification permission first
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "denied") {
        console.warn("FCM: Notification permission denied by user.");
        return null;
      }
      
      if (Notification.permission !== "granted") {
        console.log("FCM: Requesting notification permission...");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("FCM: Notification permission not granted.");
          return null;
        }
        console.log("✅ FCM: Notification permission granted");
      }
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
    if (!vapidKey) {
      console.error("FCM: VAPID key not configured!");
      return null;
    }

    const messaging = getMessaging(app);

    // Wait for service worker to be ready
    let swReg = null;
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      try {
        // Wait for existing registration or register new one
        swReg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js?v4");
        if (!swReg) {
          console.log("FCM: Registering service worker...");
          swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js?v4");
          // Wait for SW to be active
          await navigator.serviceWorker.ready;
        }
        console.log("✅ FCM: Service worker ready (v4)");
      } catch (e) {
        console.error("FCM: SW registration failed:", e?.message || e);
        return null;
      }
    } else {
      console.error("FCM: Service Worker not supported in this browser");
      return null;
    }

    console.log("FCM: Requesting token...");
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      console.error("FCM: No registration token retrieved.");
      return null;
    }

    console.log("✅ FCM: Token acquired:", token.substring(0, 20) + "...");
    return token;
  } catch (err) {
    console.error("❌ Error getting FCM token:", err);
    return null;
  }
}
