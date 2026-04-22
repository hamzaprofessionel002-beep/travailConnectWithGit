import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { workers } from "@/data/workers";
import { companies } from "@/data/companies";
import { WorkerCard } from "@/components/WorkerCard";
import { CompanyCard } from "@/components/CompanyCard";
import { useState } from "react";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [{ title: "Favoris — Travail Connect" }],
  }),
});

function FavoritesPage() {
  const { favoriteWorkers, favoriteCompanies } = useAppStore();
  const [tab, setTab] = useState<"all" | "workers" | "companies">("all");

  const favWorkers = workers.filter((w) => favoriteWorkers.has(w.id));
  const favCompanies = companies.filter((c) => favoriteCompanies.has(c.id));
  const isEmpty = favWorkers.length === 0 && favCompanies.length === 0;

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold">❤️ Favoris</h1>
          {!isEmpty && (
            <div className="flex gap-1 mt-2">
              {([ ["all", "Tous"], ["workers", "👷 Artisans"], ["companies", "🏢 Entreprises"] ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-3">
        {isEmpty ? (
          <div className="text-center py-24">
            <Heart size={48} className="mx-auto text-muted-foreground/30" />
            <p className="mt-4 font-semibold">Pas encore de favoris</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez des artisans ou entreprises à vos favoris pour les retrouver ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(tab === "all" || tab === "companies") && favCompanies.map((c) => <CompanyCard key={c.id} company={c} />)}
            {(tab === "all" || tab === "workers") && favWorkers.map((w) => <WorkerCard key={w.id} worker={w} />)}
          </div>
        )}
      </div>
    </div>
  );
}
