import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, MapPin, Mail, Bell } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/integrations/firebase/auth-context";
import { useT } from "@/i18n/useT";
import { toast } from "sonner";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: "Confidentialité — Travail Connect" }],
  }),
});

function PrivacyPage() {
  const t = useT();
  const auth = useAuth();
  const {
    showPhone, showLocation, showEmail, notificationsEnabled,
    toggleShowPhone, toggleShowLocation, toggleShowEmail, toggleNotifications,
  } = useAppStore();

  // When logged in, persist toggles to Firestore
  async function persist(patch: Partial<{ showPhone: boolean; showLocation: boolean; showEmail: boolean; acceptNotifications: boolean }>) {
    if (!auth.user) return;
    try {
      await auth.updateUserProfile(patch);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de sauvegarde");
    }
  }

  const items = [
    {
      label: t("privacy.showPhone"),
      desc: t("privacy.showPhoneDesc"),
      icon: Eye,
      enabled: showPhone,
      onToggle: () => { toggleShowPhone(); persist({ showPhone: !showPhone }); },
    },
    {
      label: t("privacy.showLocation"),
      desc: t("privacy.showLocationDesc"),
      icon: MapPin,
      enabled: showLocation,
      onToggle: () => { toggleShowLocation(); persist({ showLocation: !showLocation }); },
    },
    {
      label: t("privacy.showEmail"),
      desc: t("privacy.showEmailDesc"),
      icon: Mail,
      enabled: showEmail,
      onToggle: () => { toggleShowEmail(); persist({ showEmail: !showEmail }); },
    },
    {
      label: t("privacy.notifications"),
      desc: t("privacy.notificationsDesc"),
      icon: Bell,
      enabled: notificationsEnabled,
      onToggle: () => { toggleNotifications(); persist({ acceptNotifications: !notificationsEnabled }); },
    },
  ];

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">🔒 {t("privacy.title")}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 p-4 bg-card rounded-xl tc-shadow-card">
            <item.icon size={20} className="text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={item.onToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${item.enabled ? "bg-primary" : "bg-muted"}`}
              aria-pressed={item.enabled}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${item.enabled ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
