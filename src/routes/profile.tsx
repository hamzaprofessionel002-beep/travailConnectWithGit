import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/integrations/firebase/auth-context";
import { firebaseErrorToMessage } from "@/integrations/firebase/errors";
import { useT } from "@/i18n/useT";
import {
  Globe, Bell, Lock, LogOut, LogIn, ChevronRight, Camera, Edit2, Building2, Heart, Inbox, Star,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [{ title: "Profil — Travail Connect" }],
  }),
});

function ProfilePage() {
  const store = useAppStore();
  const auth = useAuth();
  const t = useT();
  const navigate = useNavigate();

  // Guest gets a *limited* menu: just language + "become pro".
  const guestMenu = [
    { icon: Globe, label: t("profile.language"), to: "/language" as const, extra: store.language === "fr" ? "Français" : "العربية" },
    { icon: Building2, label: t("profile.becomePro"), to: "/pro" as const, extra: undefined },
  ];

  const isPro = store.userRole === "worker" || store.userRole === "company";

  const fullMenu = [
    { icon: Edit2, label: t("profile.editProfile"), to: "/profile/edit" as const, extra: undefined },
    { icon: Heart, label: t("nav.favorites"), to: "/favorites" as const, extra: store.favoriteWorkers.size + store.favoriteCompanies.size || undefined },
    { icon: Inbox, label: t("pro.requests"), to: "/pro" as const, extra: undefined },
    { icon: Star, label: t("company.reviews"), to: "/reviews" as const, extra: undefined },
    ...(isPro ? [{ icon: Building2, label: t("profile.proSpace"), to: "/pro" as const, extra: undefined }] : []),
    { icon: Globe, label: t("profile.language"), to: "/language" as const, extra: store.language === "fr" ? "Français" : "العربية" },
    { icon: Bell, label: t("profile.notifications"), to: "/notifications" as const, extra: undefined },
    { icon: Lock, label: t("profile.privacy"), to: "/privacy" as const, extra: undefined },
  ];

  const menuItems = store.isLoggedIn ? fullMenu : guestMenu;

  async function handleLogout() {
    try {
      await auth.logout();
      toast.success("Déconnexion réussie");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    }
  }

  return (
    <div className="pb-20">
      <div className="max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="relative bg-gradient-brand pt-10 pb-16 px-4 tc-shadow-brand">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={store.isLoggedIn ? store.userAvatar : "https://api.dicebear.com/9.x/personas/svg?seed=guest"}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl bg-primary-foreground/20 object-cover border-2 border-primary-foreground/30"
              />
              {store.isLoggedIn && (
                <Link
                  to="/profile/edit"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-card rounded-full flex items-center justify-center tc-shadow-card"
                  aria-label={t("profile.editProfile")}
                >
                  <Camera size={14} className="text-foreground" />
                </Link>
              )}
            </div>
            <div className="text-primary-foreground">
              <h1 className="font-bold text-lg">{store.isLoggedIn ? store.userName : t("profile.guest")}</h1>
              {store.isLoggedIn ? (
                <>
                  {store.showPhone && store.userPhone && <p className="text-sm opacity-80">{store.userPhone}</p>}
                  {store.showLocation && store.userCity && <p className="text-sm opacity-80">{store.userCity}</p>}
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary-foreground/20 text-[10px] font-medium">
                    {store.userRole === "client" ? t("profile.client") : store.userRole === "worker" ? t("profile.worker") : t("profile.company")}
                  </span>
                </>
              ) : (
                <p className="text-sm opacity-80">{t("profile.guestHint")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="px-4 -mt-8 relative z-10">
          <div className="bg-card rounded-2xl tc-shadow-elevated overflow-hidden">
            {!store.isLoggedIn && (
              <Link
                to="/login"
                className="flex items-center gap-3 w-full px-4 py-3.5 border-b border-border active:bg-secondary transition-colors"
              >
                <LogIn size={20} className="text-primary" />
                <span className="flex-1 text-start text-sm font-medium">{t("profile.login")}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            )}
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-3 w-full px-4 py-3.5 border-b border-border last:border-0 active:bg-secondary transition-colors"
              >
                <item.icon size={20} className="text-muted-foreground" />
                <span className="flex-1 text-start text-sm font-medium">{item.label}</span>
                {item.extra && <span className="text-xs text-muted-foreground">{item.extra}</span>}
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
            {store.isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3.5 active:bg-secondary transition-colors"
              >
                <LogOut size={20} className="text-destructive" />
                <span className="flex-1 text-start text-sm font-medium text-destructive">{t("profile.logout")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats — only for logged-in users */}
        {store.isLoggedIn && (
          <div className="px-4 mt-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t("nav.favorites"), value: store.favoriteWorkers.size + store.favoriteCompanies.size, icon: "❤️" },
                { label: t("pro.requests"), value: 3, icon: "📩" },
                { label: t("company.reviews"), value: 7, icon: "⭐" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl tc-shadow-card p-3 text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-lg font-bold mt-1">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!store.isLoggedIn && (
          <div className="px-4 mt-5">
            <div className="bg-gradient-brand-soft rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold">🔐 Compte requis</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Créez un compte gratuit pour gérer votre profil, recevoir des notifications et plus encore.
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-semibold tc-shadow-brand"
              >
                {t("profile.login")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
