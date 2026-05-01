import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ArrowLeft, BellOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { markNotificationRead } from "@/integrations/firebase/notifications";

export const Route = createFileRoute("/notifications/$notifId")({
  component: NotificationDetailPage,
  head: () => ({ meta: [{ title: "Notification — Travail Connect" }] }),
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

function NotificationDetailPage() {
  const { notifId } = Route.useParams();
  const { notifications, notificationsEnabled } = useAppStore();
  const navigate = useNavigate();
  const notif = useMemo(() => notifications.find((n) => n.id === notifId), [notifications, notifId]);

  useEffect(() => {
    if (notif && !notif.read) {
      void markNotificationRead(notif.id);
    }
  }, [notif]);

  // Auto-redirect to deep link target if any
  useEffect(() => {
    if (notif?.link && notif.link !== `/notifications/${notif.id}`) {
      const t = setTimeout(() => {
        window.location.assign(notif.link!);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [notif]);

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
            <BellOff size={14} /> Les notifications sont désactivées.
          </div>
        )}
        <div className="bg-card rounded-2xl tc-shadow-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand-soft flex items-center justify-center text-2xl shrink-0">
              {notif.icon}
            </div>
            <div className="flex-1">
              {notif.urgent && (
                <span className="inline-block mb-1 text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/15 text-destructive">
                  URGENT
                </span>
              )}
              {notif.title && <p className="text-sm font-bold mb-0.5">{notif.title}</p>}
              <p className="text-base font-semibold leading-snug">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatRelative(notif.createdAtMs)}</p>
            </div>
          </div>
          {notif.link && (
            <a
              href={notif.link}
              className="mt-5 block text-center w-full px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold"
            >
              Ouvrir
            </a>
          )}
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
