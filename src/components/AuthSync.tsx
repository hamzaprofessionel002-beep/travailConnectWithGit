/**
 * Bridges the Firebase Auth context into the existing Zustand store
 * so the rest of the app (which already reads `useAppStore`) keeps
 * working without touching every component.
 */
import { useEffect } from "react";
import { useAuth } from "@/integrations/firebase/auth-context";
import { useAppStore } from "@/store/useAppStore";

export function AuthSync() {
  const { ready, user, profile } = useAuth();
  const setAuth = useAppStore((s) => s.setAuthFromFirebase);
  const setPrivacy = useAppStore((s) => s.setPrivacyFromProfile);

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
    }
  }, [ready, user, profile, setAuth, setPrivacy]);

  return null;
}
