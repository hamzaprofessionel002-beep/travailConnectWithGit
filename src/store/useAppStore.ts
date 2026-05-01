import { create } from "zustand";
import type { AppNotification } from "@/integrations/firebase/notifications";

export interface AuthSyncPayload {
  isLoggedIn: boolean;
  userName: string;
  userPhone: string;
  userCity: string;
  userRole: "client" | "worker" | "company";
  userAvatar: string;
  userId: string | null;
}

export interface PrivacySyncPayload {
  showPhone: boolean;
  showLocation: boolean;
  showEmail: boolean;
  notificationsEnabled: boolean;
}

interface AppState {
  // Favorites (persisted on the user's profile via AuthSync)
  favoriteWorkers: Set<string>;
  favoriteCompanies: Set<string>;
  setFavoritesFromProfile: (w: string[], c: string[]) => void;
  toggleFavoriteWorker: (id: string) => void;
  toggleFavoriteCompany: (id: string) => void;

  // Language
  language: "fr" | "ar";
  setLanguage: (lang: "fr" | "ar") => void;

  // Auth
  isLoggedIn: boolean;
  userId: string | null;
  userName: string;
  userPhone: string;
  userCity: string;
  userRole: "client" | "worker" | "company";
  userAvatar: string;
  setAuthFromFirebase: (payload: AuthSyncPayload) => void;
  patchProfile: (data: Partial<Pick<AppState, "userName" | "userPhone" | "userCity" | "userAvatar">>) => void;

  // Privacy
  showPhone: boolean;
  showLocation: boolean;
  showEmail: boolean;
  toggleShowPhone: () => void;
  toggleShowLocation: () => void;
  toggleShowEmail: () => void;
  setPrivacyFromProfile: (p: PrivacySyncPayload) => void;

  // Notifications (live from Firestore via AuthSync)
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  notifications: AppNotification[];
  setNotifications: (list: AppNotification[]) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  favoriteWorkers: new Set<string>(),
  favoriteCompanies: new Set<string>(),
  setFavoritesFromProfile: (w, c) =>
    set({ favoriteWorkers: new Set(w), favoriteCompanies: new Set(c) }),
  toggleFavoriteWorker: (id) =>
    set((s) => {
      const next = new Set(s.favoriteWorkers);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { favoriteWorkers: next };
    }),
  toggleFavoriteCompany: (id) =>
    set((s) => {
      const next = new Set(s.favoriteCompanies);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { favoriteCompanies: next };
    }),

  language: "fr",
  setLanguage: (lang) => set({ language: lang }),

  isLoggedIn: false,
  userId: null,
  userName: "",
  userPhone: "",
  userCity: "",
  userRole: "client",
  userAvatar: "https://api.dicebear.com/9.x/personas/svg?seed=guest",
  setAuthFromFirebase: (p) => set({ ...p }),
  patchProfile: (data) => set((s) => ({ ...s, ...data })),

  showPhone: true,
  showLocation: true,
  showEmail: false,
  toggleShowPhone: () => set((s) => ({ showPhone: !s.showPhone })),
  toggleShowLocation: () => set((s) => ({ showLocation: !s.showLocation })),
  toggleShowEmail: () => set((s) => ({ showEmail: !s.showEmail })),
  setPrivacyFromProfile: (p) => set({ ...p }),

  notificationsEnabled: true,
  toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
  notifications: [],
  setNotifications: (list) => set({ notifications: list }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
