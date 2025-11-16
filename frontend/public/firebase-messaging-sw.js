importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");
// Load config from a separate file placed in /public (not processed by Vite)
// Create /public/firebase-config.js at build/deploy time with:
//   self.FIREBASE_CONFIG = { apiKey:"...", authDomain:"...", projectId:"...", messagingSenderId:"...", appId:"..." };
importScripts("/firebase-config.js");

// Initialize using global self.FIREBASE_CONFIG defined in firebase-config.js
firebase.initializeApp(self.FIREBASE_CONFIG);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Background Message received:", payload);

    const notificationTitle =
        (payload && payload.notification && payload.notification.title) || "New Notification";
    const notificationOptions = {
        body: (payload && payload.notification && payload.notification.body) || "",
        icon: (payload && payload.notification && payload.notification.icon) || "/favicon.ico",
        data: (payload && payload.data) || {},
        // you can add actions, tag, renotify, etc. here if needed
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
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