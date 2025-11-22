// Service Worker Version (bump to force update): v4
const SW_VERSION = 'v4';
console.log('[SW] Starting service worker', SW_VERSION);
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");
// Load config from a separate file placed in /public (not processed by Vite)
// Create /public/firebase-config.js at build/deploy time with:
//   self.FIREBASE_CONFIG = { apiKey:"...", authDomain:"...", projectId:"...", messagingSenderId:"...", appId:"..." };
importScripts("/firebase-config.js");

// Initialize using global self.FIREBASE_CONFIG defined in firebase-config.js
firebase.initializeApp(self.FIREBASE_CONFIG);
// Take control immediately after install to replace old version
self.addEventListener('install', (evt) => {
    console.log('[SW] Install', SW_VERSION);
    self.skipWaiting();
});
self.addEventListener('activate', (evt) => {
    console.log('[SW] Activate', SW_VERSION);
    evt.waitUntil(clients.claim());
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background Message received:', payload);
    // Option A: rely solely on webpush.notification provided by FCM.
    // If no notification block, skip manual display to avoid generic duplicates.
    if (payload?.notification) {
        console.log('[SW v4] webpush.notification present; displaying only backend-provided notification. Title:', payload.notification.title);
    } else {
        console.log('[SW v4] No notification field; skipping (ensuring no generic duplicate). Raw data:', payload?.data);
    }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const clickActionUrl = (event.notification && event.notification.data && event.notification.data.url) || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === clickActionUrl && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(clickActionUrl);
            }
        })
    );
});