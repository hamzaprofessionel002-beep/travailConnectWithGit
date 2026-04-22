import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Building2, BadgeCheck, MapPin, ArrowUpDown } from "lucide-react";
import { companies } from "@/data/companies";
import { CompanyCard } from "@/components/CompanyCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/i18n/useT";

type SortKey = "rating" | "reviews" | "name";

export const Route = createFileRoute("/entreprises")({
  component: EntreprisesPage,
  head: () => ({
    meta: [
      { title: "Entreprises — Travail Connect" },
      { name: "description", content: "Annuaire des entreprises de services en Tunisie : peinture, plomberie, électricité, climatisation, construction." },
      { property: "og:title", content: "Entreprises — Travail Connect" },
      { property: "og:description", content: "Annuaire des entreprises de services en Tunisie." },
    ],
  }),
});

function EntreprisesPage() {
  const { selectedCategory, searchQuery, setSearchQuery } = useAppStore();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const t = useT();

  const stats = useMemo(() => {
    const verified = companies.filter((c) => c.verified).length;
    const cities = new Set(companies.map((c) => c.city)).size;
    return { total: companies.length, verified, cities };
  }, []);

  const filtered = useMemo(() => {
    const list = companies.filter((c) => {
      if (selectedCategory && c.category !== selectedCategory) return false;
      if (verifiedOnly && !c.verified) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.category.toLowerCase().includes(q) &&
          !c.city.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "reviews") return b.reviewsCount - a.reviewsCount;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [selectedCategory, verifiedOnly, searchQuery, sortKey]);

  const cycleSort = () => {
    setSortKey((k) => (k === "rating" ? "reviews" : k === "reviews" ? "name" : "rating"));
  };
  const sortLabel =
    sortKey === "rating"
      ? t("entreprises.sortRating")
      : sortKey === "reviews"
      ? t("entreprises.sortReviews")
      : t("entreprises.sortName");

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="bg-gradient-brand text-primary-foreground">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-card/15 backdrop-blur flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg leading-tight">{t("entreprises.heroTitle")}</h1>
              <p className="text-xs opacity-90">{t("entreprises.heroSubtitle")}</p>
            </div>
            <Link
              to="/pro"
              className="px-3 py-1.5 rounded-lg bg-card/20 backdrop-blur text-xs font-semibold active:scale-95 transition-transform"
            >
              {t("profile.proSpace")}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-xl bg-card/10 backdrop-blur px-2 py-2 text-center">
              <div className="text-lg font-bold leading-none">{stats.total}</div>
              <div className="text-[10px] opacity-90 mt-1">{t("entreprises.total")}</div>
            </div>
            <div className="rounded-xl bg-card/10 backdrop-blur px-2 py-2 text-center">
              <div className="text-lg font-bold leading-none flex items-center justify-center gap-1">
                <BadgeCheck size={14} /> {stats.verified}
              </div>
              <div className="text-[10px] opacity-90 mt-1">{t("entreprises.verified")}</div>
            </div>
            <div className="rounded-xl bg-card/10 backdrop-blur px-2 py-2 text-center">
              <div className="text-lg font-bold leading-none flex items-center justify-center gap-1">
                <MapPin size={14} /> {stats.cities}
              </div>
              <div className="text-[10px] opacity-90 mt-1">{t("entreprises.cities")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto">
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("common.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 ps-9 pe-4 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex gap-1.5 px-4 pb-2 items-center">
            <button
              onClick={() => setVerifiedOnly(false)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !verifiedOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t("browse.all")}
            </button>
            <button
              onClick={() => setVerifiedOnly(true)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                verifiedOnly ? "bg-tc-verified text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <BadgeCheck size={12} />
              {t("entreprises.verifiedOnly")}
            </button>
            <button
              onClick={cycleSort}
              className="ms-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground active:scale-95 transition-transform"
              aria-label={t("entreprises.sort")}
            >
              <ArrowUpDown size={12} />
              {sortLabel}
            </button>
          </div>

          <CategoryFilter />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-3">
        <p className="text-[11px] text-muted-foreground mb-2">
          {filtered.length} {t("entreprises.total")}
        </p>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">🏢</span>
            <p className="mt-2 font-medium">{t("common.noResults")}</p>
            <p className="text-sm text-muted-foreground">{t("common.tryOtherSearch")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
