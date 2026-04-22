import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, Star, MapPin, BadgeCheck, Clock, Phone, MessageCircle, Send, ThumbsUp } from "lucide-react";
import { workers } from "@/data/workers";
import { useAppStore } from "@/store/useAppStore";
import { QuoteModal } from "@/components/QuoteModal";
import { ContactModal } from "@/components/ContactModal";

export const Route = createFileRoute("/worker/$workerId")({
  component: WorkerDetailPage,
  loader: ({ params }) => {
    const worker = workers.find((w) => w.id === params.workerId);
    if (!worker) throw notFound();
    return { worker };
  },
  notFoundComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-2 font-medium">Artisan non trouvé</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">Retour</Link>
      </div>
    </div>
  ),
});

function WorkerDetailPage() {
  const { worker } = Route.useLoaderData();
  const { favoriteWorkers, toggleFavoriteWorker } = useAppStore();
  const isFav = favoriteWorkers.has(worker.id);
  const [showQuote, setShowQuote] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());

  const reviews = [
    { id: 1, author: "Amine B.", rating: 5, text: "Excellent travail, très professionnel et ponctuel.", date: "Il y a 2 jours", likes: 3 },
    { id: 2, author: "Fatma K.", rating: 4, text: "Bon travail, je recommande.", date: "Il y a 1 semaine", likes: 1 },
    { id: 3, author: "Youssef M.", rating: 5, text: "Travail impeccable, prix raisonnable.", date: "Il y a 2 semaines", likes: 5 },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/browse" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-sm font-semibold truncate mx-2">{worker.name}</h1>
          <button onClick={() => toggleFavoriteWorker(worker.id)} className="p-1 -mr-1 active:scale-90 transition-transform">
            <Heart size={22} className={isFav ? "fill-destructive text-destructive" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Profile */}
        <div className="px-4 pt-4 flex gap-4">
          <img src={worker.avatar} alt={worker.name} className="w-24 h-24 rounded-2xl bg-secondary object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h2 className="font-bold text-lg">{worker.name}</h2>
              {worker.verified && <BadgeCheck size={18} className="text-tc-verified" />}
            </div>
            <p className="text-sm text-muted-foreground">{worker.profession}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <span className="flex items-center gap-0.5"><Star size={12} className="fill-tc-yellow text-tc-yellow" /> {worker.rating} ({worker.reviewsCount})</span>
              <span className="flex items-center gap-0.5"><MapPin size={11} /> {worker.city}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-tc-worker/10 text-tc-worker text-[10px] font-medium">👷 Artisan</span>
              <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium"><Clock size={10} className="inline mr-0.5" />{worker.experience} ans</span>
              {worker.available && <span className="px-2 py-0.5 rounded-md bg-tc-green/10 text-tc-green text-[10px] font-medium">🟢 Disponible</span>}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="px-4 mt-4">
          <div className="bg-accent rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-primary">{worker.hourlyRate} DT</span>
            <span className="text-sm text-muted-foreground"> / heure</span>
          </div>
        </div>

        {/* Bio */}
        <div className="px-4 mt-4">
          <h3 className="font-semibold text-sm mb-1">À propos</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{worker.bio}</p>
        </div>

        {/* Skills */}
        <div className="px-4 mt-4">
          <h3 className="font-semibold text-sm mb-2">Compétences</h3>
          <div className="flex flex-wrap gap-1.5">
            {worker.skills.map((s: string) => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium">{s}</span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm px-4 mb-2">🖼️ Portfolio</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4">
            {worker.portfolio.map((img: string, i: number) => (
              <button key={i} onClick={() => setSelectedImg(img)} className="shrink-0">
                <img src={img} alt={`Projet ${i + 1}`} className="w-32 h-24 rounded-xl object-cover bg-secondary" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="px-4 mt-4">
          <h3 className="font-semibold text-sm mb-2">⭐ Avis</h3>
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="bg-card rounded-xl tc-shadow-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.author}</span>
                  <div className="flex gap-0.5">{Array.from({ length: r.rating }, (_, i) => <Star key={i} size={11} className="fill-tc-yellow text-tc-yellow" />)}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">{r.date}</span>
                  <button
                    onClick={() => setLikedReviews((prev) => { const n = new Set(prev); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })}
                    className="flex items-center gap-1 text-xs active:scale-90 transition-transform"
                  >
                    <ThumbsUp size={12} className={likedReviews.has(r.id) ? "fill-primary text-primary" : "text-muted-foreground"} />
                    <span>{r.likes + (likedReviews.has(r.id) ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <div className="max-w-lg mx-auto flex gap-2 px-4 py-3">
          <button onClick={() => setShowContact(true)} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary text-sm font-medium active:scale-[0.97] transition-transform">
            <Phone size={16} /> Contacter
          </button>
          <button onClick={() => setShowQuote(true)} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-[0.97] transition-transform">
            <Send size={16} /> Demander devis
          </button>
        </div>
      </div>

      {/* Modals */}
      {showQuote && <QuoteModal name={worker.name} targetType="worker" targetId={worker.id} onClose={() => setShowQuote(false)} />}
      {showContact && <ContactModal name={worker.name} phone={worker.phone} onClose={() => setShowContact(false)} />}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="" className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}
