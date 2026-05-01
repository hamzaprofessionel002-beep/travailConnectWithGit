import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, BadgeCheck } from "lucide-react";
import { workers } from "@/data/workers";
import { companies } from "@/data/companies";
import { WorkerCard } from "@/components/WorkerCard";
import { CompanyCard } from "@/components/CompanyCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/i18n/useT";

type SearchParams = { tab?: "all" | "workers" | "companies"; category?: string };

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    tab: (search.tab as SearchParams["tab"]) || undefined,
    category: (search.category as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explorer — Travail Connect" },
      { name: "description", content: "Parcourir artisans et entreprises de services en Tunisie." },
    ],
  }),
});

function BrowsePage() {
  const { tab, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const activeTab = tab ?? "all";
  const selectedCategory = category ?? null;
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { searchQuery, setSearchQuery } = useAppStore();
  const t = useT();

  const setTab = (next: SearchParams["tab"]) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, tab: next }) });
  const setCategory = (next: string | null) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, category: next ?? undefined }) });

  const filteredWorkers = workers.filter((w) => {
    if (selectedCategory && w.category !== selectedCategory) return false;
    if (verifiedOnly && !w.verified) return false;
    if (searchQuery && !w.name.toLowerCase().includes(searchQuery.toLowerCase()) && !w.profession.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredCompanies = companies.filter((c) => {
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (verifiedOnly && !c.verified) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pb-20">
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

          <div className="flex gap-1 px-4 pb-2 items-center">
            {([
              ["all", t("browse.all")],
              ["workers", t("browse.workers")],
              ["companies", t("browse.companies")],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              aria-pressed={verifiedOnly}
              className={`ms-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                verifiedOnly ? "bg-tc-verified text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <BadgeCheck size={13} />
              {t("explorer.verifiedOnly")}
            </button>
          </div>

          <CategoryFilter value={selectedCategory} onChange={setCategory} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        {(activeTab === "all" || activeTab === "companies") &&
          filteredCompanies.map((c) => <CompanyCard key={c.id} company={c} />)}
        {(activeTab === "all" || activeTab === "workers") &&
          filteredWorkers.map((w) => <WorkerCard key={w.id} worker={w} />)}

        {filteredWorkers.length === 0 && filteredCompanies.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl">🔍</span>
            <p className="mt-2 font-medium">Aucun résultat</p>
            <p className="text-sm text-muted-foreground">Essayez une autre recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}
