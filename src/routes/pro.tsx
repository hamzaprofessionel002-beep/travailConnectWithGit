import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, BarChart3, Inbox, Eye, Plus, Megaphone, Settings, ChevronRight, Loader2, Wrench } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/integrations/firebase/auth-context";
import { fetchRequestsForPro, fetchQuotesForTarget } from "@/integrations/firebase/services";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/pro")({
  component: ProDashboard,
  head: () => ({
    meta: [
      { title: "Espace Pro — Travail Connect" },
      { name: "description", content: "Tableau de bord pour les professionnels : gérez vos demandes reçues, votre profil et boostez votre visibilité." },
      { property: "og:title", content: "Espace Pro — Travail Connect" },
      { property: "og:description", content: "Tableau de bord professionnel pour artisans et entreprises." },
    ],
  }),
});

interface ProRequest {
  id: string;
  category?: string;
  city?: string;
  description?: string;
  urgency?: "urgent" | "normal";
  phone?: string;
  status?: string;
}

interface ProQuote {
  id: string;
  description?: string;
  userName?: string;
  userPhone?: string;
  status?: string;
}

function ProDashboard() {
  const t = useT();
  const { isLoggedIn, userName, userRole } = useAppStore();
  const auth = useAuth();
  const profile = auth.profile;

  const [requests, setRequests] = useState<ProRequest[]>([]);
  const [quotes, setQuotes] = useState<ProQuote[]>([]);
  const [loading, setLoading] = useState(false);

  const isPro = userRole === "worker" || userRole === "company";
  const profileComplete = isPro && profile?.category && (profile?.profession || profile?.companyName);

  useEffect(() => {
    if (!auth.user || !isPro) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [reqs, qs] = await Promise.all([
          fetchRequestsForPro({ category: profile?.category ?? null, limit: 20 }),
          fetchQuotesForTarget(userRole as "worker" | "company", auth.user!.uid),
        ]);
        if (!cancelled) {
          setRequests(reqs as ProRequest[]);
          setQuotes(qs as ProQuote[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [auth.user, isPro, userRole, profile?.category]);

  // ─── GUEST OR CLIENT (non-pro) ───
  if (!isLoggedIn) {
    return (
      <ProLanding
        title={t("pro.welcome")}
        body="Créez un compte pour accéder à votre espace pro et recevoir des demandes."
        cta="Se connecter"
        to="/login"
      />
    );
  }

  if (!isPro) {
    return (
      <ProLanding
        title="Devenez Pro"
        body="Vous êtes inscrit en tant que client. Devenez artisan ou entreprise pour recevoir des demandes."
        cta="Devenir Pro"
        to="/profile/complete"
      />
    );
  }

  // ─── PRO USER WITH INCOMPLETE PROFILE ───
  if (!profileComplete) {
    return (
      <ProLanding
        title={`${t("pro.welcome")} ${userName ? `, ${userName}` : ""}`}
        body="Complétez votre profil professionnel pour recevoir des demandes correspondant à votre métier."
        cta="Compléter mon profil"
        to="/profile/complete"
      />
    );
  }

  // ─── PRO DASHBOARD ───
  const newCount = requests.filter((r) => r.status === "open" || !r.status).length;
  const acceptedCount = quotes.filter((q) => q.status === "accepted").length;
  const pendingCount = quotes.filter((q) => q.status === "pending" || !q.status).length;

  const stats = [
    { icon: Inbox, label: t("pro.newRequests"), value: newCount, color: "text-tc-orange", bg: "bg-tc-orange/10" },
    { icon: BarChart3, label: t("pro.pendingRequests"), value: pendingCount, color: "text-tc-yellow", bg: "bg-tc-yellow/10" },
    { icon: Eye, label: t("pro.acceptedRequests"), value: acceptedCount, color: "text-tc-green", bg: "bg-tc-green/10" },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-brand pt-8 pb-12 px-4 tc-shadow-brand">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              {userRole === "company" ? (
                <Building2 size={22} className="text-primary-foreground" />
              ) : (
                <Wrench size={22} className="text-primary-foreground" />
              )}
            </div>
            <div className="text-primary-foreground flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">{t("pro.welcome")}</h1>
              <p className="text-xs opacity-80 truncate">
                {profile?.companyName || profile?.profession || userName} · {profile?.category}
              </p>
            </div>
            <Link
              to="/profile/edit"
              className="p-2 rounded-lg bg-primary-foreground/15 active:scale-95 transition-transform"
              aria-label="Paramètres du profil pro"
            >
              <Settings size={18} className="text-primary-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl tc-shadow-card p-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-lg font-bold mt-2">{s.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Promote banner */}
        <Link
          to="/profile/edit"
          className="mt-4 w-full bg-gradient-to-r from-primary to-tc-orange-light/60 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform tc-shadow-elevated"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <Megaphone size={20} className="text-primary-foreground" />
          </div>
          <div className="flex-1 text-start text-primary-foreground">
            <p className="font-bold text-sm">{t("pro.promote")}</p>
            <p className="text-[11px] opacity-90">Enrichissez votre portfolio pour attirer plus de clients</p>
          </div>
          <ChevronRight size={18} className="text-primary-foreground" />
        </Link>

        {/* My listing */}
        {auth.user && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold mb-2 px-1">
              {userRole === "company" ? t("pro.myCompany") : "Mon profil public"}
            </h2>
            <Link
              to={userRole === "company" ? "/company/$companyId" : "/worker/$workerId"}
              params={userRole === "company" ? { companyId: auth.user.uid } : { workerId: auth.user.uid }}
              className="block bg-card rounded-xl tc-shadow-card p-3 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <img
                  src={profile?.avatar ?? `https://api.dicebear.com/9.x/personas/svg?seed=${auth.user.uid}`}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-secondary"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {profile?.companyName || profile?.displayName || userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.category} · {profile?.city || "—"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </Link>
          </section>
        )}

        {/* Add service / portfolio cta */}
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold">Mon portfolio</h2>
            <Link to="/profile/edit" className="text-xs font-medium text-primary flex items-center gap-1 active:scale-95 transition-transform">
              <Plus size={14} /> Ajouter
            </Link>
          </div>
          <div className="bg-card rounded-xl tc-shadow-card p-3">
            {profile?.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {profile.portfolio.slice(0, 6).map((url) => {
                  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/");
                  return (
                    <div key={url} className="aspect-square rounded-lg overflow-hidden bg-secondary">
                      {isVideo ? (
                        <video src={url} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Aucun média. Ajoutez photos ou vidéos pour valoriser votre travail.
              </p>
            )}
          </div>
        </section>

        {/* Requests received */}
        <section className="mt-5">
          <h2 className="text-sm font-semibold mb-2 px-1">{t("pro.requests")}</h2>
          <div className="bg-card rounded-xl tc-shadow-card divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              </div>
            ) : requests.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 px-4">
                Aucune demande pour le moment dans votre catégorie « {profile?.category} ».
              </p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold shrink-0">
                    {(r.category ?? "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-medium truncate">{r.category}</p>
                      {r.urgency === "urgent" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">URGENT</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{r.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{r.city}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      r.status === "open" || !r.status
                        ? "bg-tc-orange/15 text-tc-orange"
                        : r.status === "accepted"
                          ? "bg-tc-green/15 text-tc-green"
                          : "bg-tc-yellow/15 text-tc-yellow"
                    }`}
                  >
                    {r.status === "accepted" ? "Accepté" : r.status === "closed" ? "Clos" : "Nouveau"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProLanding({ title, body, cta, to }: { title: string; body: string; cta: string; to: "/login" | "/profile/complete" }) {
  return (
    <div className="pb-20 min-h-screen">
      <div className="bg-gradient-brand pt-12 pb-16 px-4 tc-shadow-brand">
        <div className="max-w-lg mx-auto text-primary-foreground">
          <Building2 size={40} className="opacity-90" />
          <h1 className="font-bold text-2xl mt-3">{title}</h1>
          <p className="text-sm opacity-90 mt-2">{body}</p>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 -mt-8">
        <div className="bg-card rounded-2xl tc-shadow-elevated p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><span className="text-lg">📩</span><span>Recevez des demandes de devis ciblées</span></li>
            <li className="flex items-start gap-3"><span className="text-lg">⭐</span><span>Construisez votre réputation avec des avis</span></li>
            <li className="flex items-start gap-3"><span className="text-lg">🚀</span><span>Boostez votre visibilité auprès des clients</span></li>
          </ul>
          <Link
            to={to}
            className="mt-5 block text-center w-full px-4 py-3 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold tc-shadow-brand"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
