import { Link } from "@tanstack/react-router";
import { Star, MapPin, Heart, BadgeCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Worker } from "@/data/workers";

export function WorkerCard({ worker }: { worker: Worker }) {
  const { favoriteWorkers, toggleFavoriteWorker } = useAppStore();
  const isFav = favoriteWorkers.has(worker.id);

  return (
    <Link
      to="/worker/$workerId"
      params={{ workerId: worker.id }}
      className="block bg-card rounded-xl tc-shadow-card overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="p-3 flex gap-3">
        <div className="relative shrink-0">
          <img
            src={worker.avatar}
            alt={worker.name}
            className="w-16 h-16 rounded-xl bg-secondary object-cover"
            loading="lazy"
          />
          {worker.available && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-tc-green rounded-full border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-sm truncate">{worker.name}</h3>
                {worker.verified && <BadgeCheck size={14} className="text-tc-verified shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground">{worker.profession}</p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavoriteWorker(worker.id);
              }}
              className="p-1.5 -m-1 active:scale-90 transition-transform"
            >
              <Heart
                size={18}
                className={isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}
              />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-0.5 text-xs">
              <Star size={12} className="fill-tc-yellow text-tc-yellow" />
              <span className="font-medium">{worker.rating}</span>
              <span className="text-muted-foreground">({worker.reviewsCount})</span>
            </span>
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MapPin size={11} />
              {worker.city}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-tc-worker/10 text-tc-worker text-[10px] font-medium">
              👷 Artisan
            </span>
            <span className="text-xs font-semibold text-primary">{worker.hourlyRate} DT/h</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
