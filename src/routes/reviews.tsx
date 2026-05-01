import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
  head: () => ({ meta: [{ title: "Mes avis — Travail Connect" }] }),
});

// Mock reviews until a `reviews` collection is wired in Firestore.
const mockReviews = [
  { id: "r1", target: "ProPeinture Tunisie", category: "Peinture", rating: 5, comment: "Travail impeccable, très professionnel. Je recommande !", date: "Il y a 3 jours" },
  { id: "r2", target: "Mohamed Trabelsi", category: "Plomberie", rating: 4, comment: "Intervention rapide, problème résolu en 1h.", date: "Il y a 2 semaines" },
  { id: "r3", target: "ÉlectroPlus", category: "Électricité", rating: 5, comment: "Équipe sérieuse et tarifs honnêtes.", date: "Il y a 1 mois" },
];

function ReviewsPage() {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">⭐ Mes avis</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4">
        {!isLoggedIn ? (
          <div className="text-center py-20">
            <Star size={48} className="mx-auto text-muted-foreground/30" />
            <p className="mt-4 font-semibold">Connexion requise</p>
            <p className="text-sm text-muted-foreground mt-1">Connectez-vous pour voir vos avis.</p>
            <Link to="/login" className="inline-block mt-4 px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold">
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mockReviews.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl tc-shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{r.target}</p>
                    <p className="text-[11px] text-muted-foreground">{r.category} · {r.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? "fill-tc-yellow text-tc-yellow" : "text-muted-foreground/30"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-snug">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
