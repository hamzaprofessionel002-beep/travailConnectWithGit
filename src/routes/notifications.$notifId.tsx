import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, BellOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/notifications/$notifId")({
  component: NotificationDetailPage,
  head: () => ({ meta: [{ title: "Notification — Travail Connect" }] }),
});

function NotificationDetailPage() {
  const { notifId } = Route.useParams();
  const { notifications, markNotificationRead, notificationsEnabled } = useAppStore();
  const navigate = useNavigate();
  const notif = notifications.find((n) => n.id === notifId);

  useEffect(() => {
    if (notif && !notif.read) markNotificationRead(notif.id);
  }, [notif, markNotificationRead]);

  if (!notif) {
    return (
      <div className="pb-20">
        <Header />
        <div className="max-w-lg mx-auto px-4 mt-10 text-center">
          <p className="text-sm text-muted-foreground">Notification introuvable.</p>
          <button onClick={() => navigate({ to: "/notifications" })} className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Header />
      <div className="max-w-lg mx-auto px-4 mt-5">
        {!notificationsEnabled && (
          <div className="mb-4 p-3 rounded-xl bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
            <BellOff size={14} /> Les notifications sont désactivées. Réactivez-les pour recevoir les nouveautés.
          </div>
        )}
        <div className="bg-card rounded-2xl tc-shadow-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand-soft flex items-center justify-center text-2xl shrink-0">
              {notif.icon}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold leading-snug">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm text-muted-foreground">
            <p>Cette notification a été marquée comme lue automatiquement.</p>
            <p className="text-xs">Astuce : appuyez sur « Activer les notifications » dans la liste pour gérer les alertes.</p>
          </div>
        </div>
        <Link to="/notifications" className="mt-4 block text-center text-xs font-medium text-primary">
          ← Toutes les notifications
        </Link>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
        <Link to="/notifications" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
        <h1 className="text-lg font-bold flex-1">Détails</h1>
      </div>
    </div>
  );
}
