/* eslint-disable */
/**
 * Firebase Cloud Messaging service worker.
 *
 * This file MUST be served from the site root (not /assets/) so browsers
 * accept it as a top-level service worker.
 *
 * IMPORTANT: replace the placeholder config below with YOUR Firebase web
 * config (the same values used in `.env`). The SW cannot read import.meta.env.
 *
 * If you don't use FCM yet, this file is harmless — it self-disables when
 * the config is left as placeholders.
 */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB_6J2ox63DQ-t4PkKu9EtfS6IvNp__1RQ",
  authDomain: "travail-connect.firebaseapp.com",
  projectId: "travail-connect",
  storageBucket: "travail-connect.firebasestorage.app",
  messagingSenderId: "969104050547",
  appId: "1:969104050547:web:b0d97ae1c7240ff1a71d06",
};

const isConfigured = !Object.values(FIREBASE_CONFIG).some((v) => String(v).includes("REPLACE_ME"));

if (isConfigured) {
  firebase.initializeApp(FIREBASE_CONFIG);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || "Travail Connect";
    const options = {
      body: (payload.notification && payload.notification.body) || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: payload.data || {},
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) {
          w.navigate(link);
          return w.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    }),
  );
});
