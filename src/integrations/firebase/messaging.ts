/**
 * Firebase Cloud Messaging (FCM) — client-side skeleton.
 *
 * MANUAL SETUP REQUIRED to actually receive push notifications:
 *
 * 1. Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
 *    → "Generate key pair". Copy the VAPID public key.
 *
 * 2. Add to your .env file:
 *      VITE_FIREBASE_VAPID_KEY=BPnXXXXXXXXXXXXXXXXXXXXXX
 *
 * 3. The service worker `public/firebase-messaging-sw.js` is already shipped.
 *    Make sure your `VITE_FIREBASE_*` keys match the ones inside it
 *    (or update the SW with your real config — the file embeds them at build).
 *
 * 4. Sending push notifications requires either:
 *      - a Firebase Cloud Function with the FCM Admin SDK, OR
 *      - a backend that calls FCM HTTP v1.
 *    The Web SDK does NOT allow sending to other devices for security reasons.
 *    Until then, in-app notifications (Firestore) work everywhere.
 *
 * Without VAPID key, this module is a no-op — no errors, no crash.
 */
import { doc, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./client";

const VAPID_KEY: string | undefined = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export const isFcmAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  if (!isFirebaseConfigured || !VAPID_KEY) return false;
  return "Notification" in window && "serviceWorker" in navigator;
};

/**
 * Request notification permission, register the service worker,
 * and store the FCM token on the user's profile.
 *
 * Safe to call multiple times — idempotent.
 */
export async function registerFcmTokenForUser(userId: string): Promise<string | null> {
  if (!isFcmAvailable()) return null;
  try {
    // Lazy import — don't bundle messaging if not used
    const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
    const supported = await isSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return null;

    await setDoc(
      doc(getDb(), "profiles", userId),
      { fcmTokens: arrayUnion(token), updatedAt: serverTimestamp() },
      { merge: true },
    );
    return token;
  } catch (e) {
    console.warn("registerFcmTokenForUser failed (non-fatal)", e);
    return null;
  }
}

/** Listen for foreground push messages (no-op when FCM unavailable). */
export async function onForegroundMessage(cb: (payload: unknown) => void): Promise<() => void> {
  if (!isFcmAvailable()) return () => {};
  try {
    const { getMessaging, onMessage, isSupported } = await import("firebase/messaging");
    if (!(await isSupported())) return () => {};
    const messaging = getMessaging();
    return onMessage(messaging, cb);
  } catch {
    return () => {};
  }
}
