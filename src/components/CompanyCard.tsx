import { Link } from "@tanstack/react-router";
import { Star, MapPin, Heart, BadgeCheck, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import type { Company } from "@/data/companies";

export function CompanyCard({ company }: { company: Company }) {
  const { favoriteCompanies, toggleFavoriteCompany, isLoggedIn } = useAppStore();
  const isFav = favoriteCompanies.has(company.id);

  return (
    <Link
      to="/company/$companyId"
      params={{ companyId: company.id }}
      className="block bg-card rounded-xl tc-shadow-card overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="relative h-24 bg-secondary">
        <img src={company.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        <img
          src={company.logo}
          alt={company.name}
          className="absolute -bottom-5 left-3 w-11 h-11 rounded-lg border-2 border-card bg-card object-cover"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLoggedIn) {
              toast.info("Connectez-vous pour sauvegarder vos favoris");
              return;
            }
            toggleFavoriteCompany(company.id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm active:scale-90 transition-transform"
        >
          <Heart
            size={16}
            className={isFav ? "fill-destructive text-destructive" : "text-foreground/70"}
          />
        </button>
      </div>
      <div className="pt-7 pb-3 px-3">
        <div className="flex items-center gap-1">
          <h3 className="font-semibold text-sm truncate">{company.name}</h3>
          {company.verified && <BadgeCheck size={14} className="text-tc-verified shrink-0" />}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-0.5 text-xs">
            <Star size={12} className="fill-tc-yellow text-tc-yellow" />
            <span className="font-medium">{company.rating}</span>
            <span className="text-muted-foreground">({company.reviewsCount})</span>
          </span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <MapPin size={11} />
            {company.city}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Users size={11} /> {company.teamSize} employés
          </span>
          <span className="flex items-center gap-0.5">
            <Clock size={11} /> {company.responseTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-tc-company/10 text-tc-company text-[10px] font-medium">
            🏢 Entreprise
          </span>
          <span className="text-xs font-semibold text-primary">{company.priceRange}</span>
        </div>
      </div>
    </Link>
  );
}
