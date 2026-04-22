import { create } from "zustand";

interface Notification {
  id: string;
  icon: string;
  message: string;
  time: string;
  read: boolean;
}

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
  // Favorites
  favoriteWorkers: Set<string>;
  favoriteCompanies: Set<string>;
  toggleFavoriteWorker: (id: string) => void;
  toggleFavoriteCompany: (id: string) => void;

  // Language
  language: "fr" | "ar";
  setLanguage: (lang: "fr" | "ar") => void;

  // Auth (synced from Firebase via AuthSync)
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

  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;

  // Search & filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  favoriteWorkers: new Set<string>(),
  favoriteCompanies: new Set<string>(),
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
  notifications: [
    { id: "n1", icon: "🔔", message: "Nouveau artisan disponible près de chez vous", time: "Il y a 5 min", read: false },
    { id: "n2", icon: "📩", message: "Votre demande de devis a reçu une réponse", time: "Il y a 1h", read: false },
    { id: "n3", icon: "🟢", message: "Mohamed Trabelsi est maintenant disponible", time: "Il y a 2h", read: false },
    { id: "n4", icon: "🏢", message: "ProPeinture Tunisie a ajouté un nouveau service", time: "Il y a 3h", read: true },
    { id: "n5", icon: "⭐", message: "Votre avis a été publié avec succès", time: "Il y a 5h", read: true },
    { id: "n6", icon: "📢", message: "Offre spéciale : -20% sur la peinture ce mois", time: "Il y a 1 jour", read: true },
  ],
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  selectedCategory: null,
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
}));
