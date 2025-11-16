import { isSupported, getMessaging, getToken } from "firebase/messaging";
import { app } from "../components/auth/firebase";

export async function getFCMToken() {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM: Messaging not supported in this browser.");
      return null;
    }

    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("FCM: Notification permission not granted.");
        return null;
      }
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
    const messaging = getMessaging(app);

    let swReg = null;
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      try {
        swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (e) {
        console.warn("FCM: SW registration failed, continuing without SW:", e?.message || e);
      }
    }

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: swReg || undefined,
    });

    if (!token) {
      console.warn("FCM: No registration token retrieved.");
      return null;
    }

    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
}
