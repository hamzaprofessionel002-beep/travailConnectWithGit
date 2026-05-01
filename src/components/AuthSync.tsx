/**
 * Bridges Firebase Auth into Zustand:
 *  - mirrors profile/auth fields
 *  - subscribes to user's notifications (Firestore realtime)
 *  - persists favorites to the user's profile when they change
 *  - registers FCM token after login if available
 */
import { useEffect, useRef } from "react";
import { useAuth } from "@/integrations/firebase/auth-context";
import { useAppStore } from "@/store/useAppStore";
import { subscribeToUserNotifications } from "@/integrations/firebase/notifications";
import { registerFcmTokenForUser, isFcmAvailable } from "@/integrations/firebase/messaging";

export function AuthSync() {
  const { ready, user, profile, updateUserProfile } = useAuth();
  const setAuth = useAppStore((s) => s.setAuthFromFirebase);
  const setPrivacy = useAppStore((s) => s.setPrivacyFromProfile);
  const setFavorites = useAppStore((s) => s.setFavoritesFromProfile);
  const setNotifications = useAppStore((s) => s.setNotifications);
  const favoriteWorkers = useAppStore((s) => s.favoriteWorkers);
  const favoriteCompanies = useAppStore((s) => s.favoriteCompanies);
  const lastSyncedFavs = useRef<string>("");

  // Mirror user/profile into the store
  useEffect(() => {
    if (!ready) return;
    if (user && profile) {
      setAuth({
        isLoggedIn: true,
        userName: profile.displayName ?? user.email ?? "Utilisateur",
        userPhone: profile.phone ?? user.phoneNumber ?? "",
        userCity: profile.city ?? "",
        userRole: profile.role ?? "client",
        userAvatar:
          profile.avatar ??
          user.photoURL ??
          `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(user.uid)}`,
        userId: user.uid,
      });
      setPrivacy({
        showPhone: profile.showPhone,
        showLocation: profile.showLocation,
        showEmail: profile.showEmail,
        notificationsEnabled: profile.acceptNotifications,
      });
      // Initial favorites snapshot from the profile
      setFavorites(profile.favoriteWorkers ?? [], profile.favoriteCompanies ?? []);
      lastSyncedFavs.current = JSON.stringify({
        w: [...(profile.favoriteWorkers ?? [])].sort(),
        c: [...(profile.favoriteCompanies ?? [])].sort(),
      });
    } else {
      setAuth({
        isLoggedIn: false,
        userName: "",
        userPhone: "",
        userCity: "",
        userRole: "client",
        userAvatar: "https://api.dicebear.com/9.x/personas/svg?seed=guest",
        userId: null,
      });
      setFavorites([], []);
      setNotifications([]);
    }
  }, [ready, user, profile, setAuth, setPrivacy, setFavorites, setNotifications]);

  // Subscribe to notifications when logged in
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserNotifications(user.uid, (list) => setNotifications(list));
    return () => unsub();
  }, [user, setNotifications]);

  // Persist favorite changes back to profile (debounced via key compare)
  useEffect(() => {
    if (!user || !profile) return;
    const w = [...favoriteWorkers].sort();
    const c = [...favoriteCompanies].sort();
    const key = JSON.stringify({ w, c });
    if (key === lastSyncedFavs.current) return;
    lastSyncedFavs.current = key;
    void updateUserProfile({ favoriteWorkers: w, favoriteCompanies: c }).catch((e) =>
      console.warn("favorites persist failed", e),
    );
  }, [favoriteWorkers, favoriteCompanies, user, profile, updateUserProfile]);

  // Register FCM token after login (if available + permission already granted)
  useEffect(() => {
    if (!user) return;
    if (!isFcmAvailable()) return;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      void registerFcmTokenForUser(user.uid);
    }
  }, [user]);

  return null;
}
