import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Bell, MapPin, ChevronRight, Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { workers, categoryList } from "@/data/workers";
import { companies } from "@/data/companies";
import { WorkerCard } from "@/components/WorkerCard";
import { CompanyCard } from "@/components/CompanyCard";
import { RequestModal } from "@/components/RequestModal";
import { useT } from "@/i18n/useT";
import { useGeolocation } from "@/hooks/useGeolocation";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Travail Connect — Trouvez des artisans en Tunisie" },
      { name: "description", content: "Connectez-vous avec des artisans et entreprises de services en Tunisie." },
    ],
  }),
});

function HomePage() {
  const { searchQuery, setSearchQuery, notifications, showLocation } = useAppStore();
  const t = useT();
  const [requestOpen, setRequestOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const geo = useGeolocation(t("home.location"));
  const locationLabel = !showLocation
    ? t("home.location")
    : geo.loading
      ? t("home.detecting")
      : (geo.city ?? t("home.location"));

  const topWorkers = workers.filter((w) => w.verified).slice(0, 6);
  const topCompanies = companies.filter((c) => c.verified).slice(0, 4);

  const quickProblems = [
    { icon: "💧", label: "Fuite d'eau", category: "Plomberie" },
    { icon: "🎨", label: "Peindre maison", category: "Peinture" },
    { icon: "⚡", label: "Panne électrique", category: "Électricité" },
    { icon: "❄️", label: "Installer clim", category: "Climatisation" },
    { icon: "🏗️", label: "Rénovation", category: "Construction" },
    { icon: "🪚", label: "Menuiserie", category: "Menuiserie" },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <Link to="/profile" className="relative active:scale-90 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center tc-shadow-brand">
              <span className="text-primary-foreground font-bold text-sm">TC</span>
            </div>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[55%] truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>
          <Link to="/notifications" className="relative p-2 -m-2 active:scale-90 transition-transform">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 ps-10 pe-4 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Publier une demande CTA */}
        <div className="px-4 mt-3">
          <button
            onClick={() => setRequestOpen(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-brand text-primary-foreground tc-shadow-brand active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-card/15 backdrop-blur flex items-center justify-center shrink-0">
              <Plus size={20} />
            </div>
            <div className="flex-1 text-start">
              <p className="font-semibold text-sm leading-tight">{t("request.cta")}</p>
              <p className="text-[11px] opacity-90 mt-0.5">{t("request.ctaHint")}</p>
            </div>
            <ChevronRight size={18} className="opacity-80" />
          </button>
        </div>

        {/* Quick Problems */}
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold mb-2">{t("home.yourNeed")}</h2>
          <div className="grid grid-cols-3 gap-2">
            {quickProblems.map((p) => (
              <Link
                key={p.label}
                to="/browse"
                search={{ category: p.category }}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card tc-shadow-card active:scale-95 transition-transform"
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="text-[11px] font-medium text-center">{p.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-5">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-semibold">{t("home.categories")}</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4">
            {categoryList.map((cat) => (
              <Link
                key={cat.name}
                to="/browse"
                search={{ category: cat.name }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card tc-shadow-card text-xs font-medium active:scale-95 transition-transform"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-semibold">{t("home.popularCompanies")}</h2>
            <Link to="/entreprises" className="text-xs text-primary font-medium flex items-center gap-0.5">
              {t("common.seeAll")} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1">
            {topCompanies.map((c) => (
              <div key={c.id} className="shrink-0 w-72">
                <CompanyCard company={c} />
              </div>
            ))}
          </div>
        </div>

        {/* Top Workers */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-semibold">{t("home.verifiedWorkers")}</h2>
            <Link to="/browse" search={{ tab: "workers" }} className="text-xs text-primary font-medium flex items-center gap-0.5">
              {t("common.seeAll")} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="px-4 space-y-2">
            {topWorkers.map((w) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
          </div>
        </div>
      </div>

      {requestOpen && <RequestModal onClose={() => setRequestOpen(false)} />}
    </div>
  );
}
