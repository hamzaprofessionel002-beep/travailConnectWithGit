import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Notifications — Travail Connect" }],
  }),
});

function NotificationsPage() {
  const { notifications, notificationsEnabled, toggleNotifications } = useAppStore();

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">🔔 Notifications</h1>
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
            onClick={toggleNotifications}
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
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <Link
                key={n.id}
                to="/notifications/$notifId"
                params={{ notifId: n.id }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors active:bg-secondary ${
                  !n.read ? "bg-accent" : "bg-card"
                }`}
              >
                <span className="text-xl mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-semibold" : ""}`}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
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
