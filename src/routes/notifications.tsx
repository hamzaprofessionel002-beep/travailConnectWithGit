import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, ArrowLeft, CheckCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/integrations/firebase/auth-context";
import { markAllNotificationsRead } from "@/integrations/firebase/notifications";
import { registerFcmTokenForUser, isFcmAvailable } from "@/integrations/firebase/messaging";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Notifications — Travail Connect" }],
  }),
});

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d} j`;
}

function NotificationsPage() {
  const { notifications, notificationsEnabled, toggleNotifications } = useAppStore();
  const auth = useAuth();

  async function handleToggle() {
    toggleNotifications();
    // Persist on profile so it follows the user
    if (auth.user) {
      try {
        await auth.updateUserProfile({ acceptNotifications: !notificationsEnabled });
      } catch (e) { console.warn(e); }
      // Try to register FCM if turning on
      if (!notificationsEnabled && isFcmAvailable()) {
        await registerFcmTokenForUser(auth.user.uid);
      }
    }
  }

  async function handleMarkAll() {
    if (auth.user) await markAllNotificationsRead(auth.user.uid);
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">🔔 Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button onClick={handleMarkAll} className="text-xs text-primary font-medium flex items-center gap-1">
              <CheckCheck size={14} /> Tout lu
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="flex items-center justify-between p-4 bg-card rounded-xl tc-shadow-card mb-4">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? <Bell size={20} className="text-primary" /> : <BellOff size={20} className="text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium">Activer les notifications</p>
              <p className="text-[11px] text-muted-foreground">
                {notificationsEnabled ? "Vous recevez les alertes" : "Aucune alerte ne sera envoyée"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            aria-label="Activer/désactiver les notifications"
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notificationsEnabled ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${notificationsEnabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        {!notificationsEnabled ? (
          <div className="text-center py-16 text-muted-foreground">
            <BellOff size={42} className="mx-auto opacity-40" />
            <p className="mt-3 text-sm font-semibold">Notifications désactivées</p>
            <p className="text-xs mt-1">Réactivez le commutateur ci-dessus pour voir vos notifications.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell size={42} className="mx-auto opacity-40" />
            <p className="mt-3 text-sm font-semibold">Aucune notification</p>
            <p className="text-xs mt-1">Vous serez alerté ici en temps réel.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <Link
                key={n.id}
                to="/notifications/$notifId"
                params={{ notifId: n.id }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors active:bg-secondary ${
                  !n.read ? "bg-accent" : "bg-card"
                } ${n.urgent ? "border-s-4 border-destructive" : ""}`}
              >
                <span className="text-xl mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {n.urgent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">URGENT</span>
                    )}
                    <p className={`text-sm truncate ${!n.read ? "font-semibold" : ""}`}>{n.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatRelative(n.createdAtMs)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
