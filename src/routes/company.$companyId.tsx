import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, Star, MapPin, BadgeCheck, Users, Clock, Phone, Send, ThumbsUp, ChevronRight, AlertTriangle } from "lucide-react";
import { companies } from "@/data/companies";
import { useAppStore } from "@/store/useAppStore";
import { QuoteModal } from "@/components/QuoteModal";
import { ContactModal } from "@/components/ContactModal";

export const Route = createFileRoute("/company/$companyId")({
  component: CompanyDetailPage,
  loader: ({ params }) => {
    const company = companies.find((c) => c.id === params.companyId);
    if (!company) throw notFound();
    return { company };
  },
  notFoundComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-2 font-medium">Entreprise non trouvée</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">Retour</Link>
      </div>
    </div>
  ),
});

function CompanyDetailPage() {
  const { company } = Route.useLoaderData();
  const { favoriteCompanies, toggleFavoriteCompany } = useAppStore();
  const isFav = favoriteCompanies.has(company.id);
  const [showQuote, setShowQuote] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());

  const categoryEmoji: Record<string, string> = {
    "Peinture": "🎨", "Plomberie": "🚰", "Électricité": "⚡",
    "Climatisation": "❄️", "Construction": "🏗️",
  };

  const reviews = [
    { id: 1, author: "Sami T.", rating: 5, text: "Service professionnel, équipe compétente et ponctuelle. Je recommande vivement.", date: "Il y a 3 jours", likes: 7 },
    { id: 2, author: "Leila M.", rating: 4, text: "Très bon travail, rapport qualité-prix excellent.", date: "Il y a 1 semaine", likes: 4 },
    { id: 3, author: "Karim B.", rating: 5, text: "Travail soigné et finitions parfaites. Merci !", date: "Il y a 2 semaines", likes: 9 },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/browse" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-sm font-semibold truncate mx-2">{company.name}</h1>
          <button onClick={() => toggleFavoriteCompany(company.id)} className="p-1 -mr-1 active:scale-90 transition-transform">
            <Heart size={22} className={isFav ? "fill-destructive text-destructive" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Cover + Logo */}
        <div className="relative h-36">
          <img src={company.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
          <img src={company.logo} alt={company.name} className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl border-3 border-card bg-card object-cover tc-shadow-card" />
        </div>

        {/* Info */}
        <div className="px-4 pt-9">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-lg">{company.name}</h2>
            {company.verified && <BadgeCheck size={18} className="text-tc-verified" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-2 py-0.5 rounded-md bg-tc-company/10 text-tc-company text-[10px] font-medium">🏢 Entreprise</span>
            <span className="text-xs text-muted-foreground">{categoryEmoji[company.category]} {company.category}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Note", value: `${company.rating}⭐`, icon: Star },
              { label: "Équipe", value: `${company.teamSize}`, icon: Users },
              { label: "Expérience", value: `${company.yearsExperience} ans`, icon: Clock },
              { label: "Ville", value: company.city, icon: MapPin },
            ].map((s) => (
              <div key={s.label} className="bg-secondary rounded-xl p-2.5 text-center">
                <p className="text-xs font-bold">{s.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span><Clock size={12} className="inline mr-1" />Réponse: {company.responseTime}</span>
            <span>💰 {company.priceRange}</span>
            {company.available ? (
              <span className="text-tc-green font-medium">🟢 Disponible</span>
            ) : (
              <span className="text-destructive font-medium">🔴 Indisponible</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="px-4 mt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
        </div>

        {/* Showroom / Services */}
        <div className="px-4 mt-5">
          <h3 className="font-bold text-sm mb-3">🏬 Showroom — Services proposés</h3>
          <div className="space-y-2">
            {company.services.map((service: { name: string; description: string; problems: string[] }, i: number) => (
              <div key={i} className="bg-card rounded-xl tc-shadow-card overflow-hidden">
                <button
                  onClick={() => setExpandedService(expandedService === i ? null : i)}
                  className="w-full flex items-center gap-3 p-3 text-left active:bg-secondary/50 transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {categoryEmoji[company.category] || "🔧"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{service.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                  </div>
                  <ChevronRight size={16} className={`text-muted-foreground transition-transform ${expandedService === i ? "rotate-90" : ""}`} />
                </button>
                {expandedService === i && (
                  <div className="px-3 pb-3 border-t border-border pt-2">
                    <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <AlertTriangle size={10} /> Problèmes courants résolus :
                      </p>
                      {service.problems.map((p: string, j: number) => (
                        <div key={j} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent">
                          <span className="text-xs">⚠️</span>
                          <span className="text-xs">{p}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowQuote(true)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-medium active:scale-[0.97] transition-transform"
                    >
                      <Send size={12} /> Demander ce service
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="mt-5">
          <h3 className="font-bold text-sm px-4 mb-2">🖼️ Réalisations</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4">
            {company.portfolio.map((img: string, i: number) => (
              <button key={i} onClick={() => setSelectedImg(img)} className="shrink-0">
                <img src={img} alt={`Projet ${i + 1}`} className="w-36 h-28 rounded-xl object-cover bg-secondary" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="px-4 mt-5">
          <h3 className="font-bold text-sm mb-2">⭐ Avis clients ({company.reviewsCount})</h3>
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

        {/* Future Monetization Banner */}
        <div className="px-4 mt-5">
          <div className="bg-gradient-to-r from-tc-yellow/20 to-tc-orange-light rounded-xl p-4">
            <p className="text-xs font-bold">📢 Vous êtes une entreprise ?</p>
            <p className="text-[11px] text-muted-foreground mt-1">Bientôt disponible : sponsorisez vos services et boostez votre visibilité !</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 rounded-md bg-card/80 text-[9px] font-medium">🚀 Promouvoir</span>
              <span className="px-2 py-1 rounded-md bg-card/80 text-[9px] font-medium">📢 Sponsoriser</span>
              <span className="px-2 py-1 rounded-md bg-card/80 text-[9px] font-medium">🔔 Notifier</span>
            </div>
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
      {showQuote && <QuoteModal name={company.name} targetType="company" targetId={company.id} onClose={() => setShowQuote(false)} />}
      {showContact && <ContactModal name={company.name} phone={company.phone} onClose={() => setShowContact(false)} />}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="" className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}
