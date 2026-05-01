/**
 * Profile completion page — appears after Google sign-in or signup so the
 * user can fill the role-specific required fields without being blocked.
 *
 * Required fields by role:
 *  - client   → name, phone, city
 *  - worker   → name, profession, category, city, experience, hourlyRate, available
 *  - company  → companyName, category, city, yearsExperience, teamSize, description, phone
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type UserRole } from "@/integrations/firebase/auth-context";
import { firebaseErrorToMessage } from "@/integrations/firebase/errors";
import { Button } from "@/components/ui/button";
import { categoryList } from "@/data/workers";

export const Route = createFileRoute("/profile/complete")({
  component: CompleteProfilePage,
  head: () => ({ meta: [{ title: "Compléter votre profil — Travail Connect" }] }),
});

function CompleteProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("client");

  // Common
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Worker
  const [profession, setProfession] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [available, setAvailable] = useState(true);

  // Company
  const [companyName, setCompanyName] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);

  // Pre-fill from existing profile (Google data ends up in displayName/avatar/email)
  useEffect(() => {
    if (auth.profile) {
      const p = auth.profile;
      setRole(p.role ?? "client");
      setDisplayName(p.displayName ?? "");
      setPhone(p.phone ?? "");
      setCity(p.city ?? "");
      setProfession(p.profession ?? "");
      setCategory(p.category ?? "");
      setExperience(p.experience ? String(p.experience) : "");
      setHourlyRate(p.hourlyRate ? String(p.hourlyRate) : "");
      setAvailable(p.available ?? true);
      setCompanyName(p.companyName ?? "");
      setYearsExperience(p.yearsExperience ? String(p.yearsExperience) : "");
      setTeamSize(p.teamSize ? String(p.teamSize) : "");
      setDescription(p.description ?? "");
    }
  }, [auth.profile]);

  if (auth.ready && !auth.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">Vous devez être connecté.</p>
        <Link to="/login" className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold">
          Se connecter
        </Link>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await auth.updateUserProfile({
        displayName: displayName.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        role,
        profession: role === "worker" ? profession.trim() || null : null,
        category: role !== "client" ? category.trim() || null : null,
        experience: role === "worker" && experience ? Number(experience) : null,
        hourlyRate: role === "worker" && hourlyRate ? Number(hourlyRate) : null,
        available: role === "worker" ? available : true,
        companyName: role === "company" ? companyName.trim() || null : null,
        yearsExperience: role === "company" && yearsExperience ? Number(yearsExperience) : null,
        teamSize: role === "company" && teamSize ? Number(teamSize) : null,
        description: role === "company" ? description.trim() || null : null,
      });
      toast.success("Profil complété ✓");
      navigate({ to: role === "client" ? "/" : "/profile" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-20 min-h-screen bg-secondary/30">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">Complétez votre profil</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-4 mt-5 space-y-5">
        <div className="bg-gradient-brand-soft rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-primary mt-0.5 shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold">Bienvenue !</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choisissez votre rôle et complétez les champs obligatoires. Vous pourrez tout modifier plus tard.
              </p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="text-xs font-semibold mb-2 block">Je suis…</label>
          <div className="grid grid-cols-3 gap-2">
            {(["client", "worker", "company"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-3 rounded-xl border-2 text-start transition-all ${
                  role === r ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="text-xs font-semibold">
                  {r === "client" ? "👤 Client" : r === "worker" ? "👷 Artisan" : "🏢 Entreprise"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {r === "client" ? "Trouver un pro" : r === "worker" ? "Indépendant" : "Équipe"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Common required */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Informations</h2>
          <Field label={role === "company" ? "Votre nom (contact) *" : "Nom complet *"} value={displayName} onChange={setDisplayName} required />
          <Field label="Téléphone *" type="tel" value={phone} onChange={setPhone} placeholder="+216 …" required />
          <Field label="Ville *" value={city} onChange={setCity} placeholder="Tunis" required />
        </div>

        {/* Worker required */}
        {role === "worker" && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground/80">👷 Métier</h2>
            <Field label="Profession * (ex: Plombier)" value={profession} onChange={setProfession} required />
            <CategoryPicker label="Catégorie *" value={category} onChange={setCategory} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Années d'expérience *" type="number" value={experience} onChange={setExperience} required />
              <Field label="Tarif horaire (DT) *" type="number" value={hourlyRate} onChange={setHourlyRate} required />
            </div>
            <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium">Disponible pour de nouveaux projets</span>
            </label>
          </div>
        )}

        {/* Company required */}
        {role === "company" && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground/80">🏢 Entreprise</h2>
            <Field label="Nom de l'entreprise *" value={companyName} onChange={setCompanyName} required />
            <CategoryPicker label="Catégorie principale *" value={category} onChange={setCategory} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Années d'expérience *" type="number" value={yearsExperience} onChange={setYearsExperience} required />
              <Field label="Taille équipe *" type="number" value={teamSize} onChange={setTeamSize} required />
            </div>
            <TextArea label="Description *" value={description} onChange={setDescription} placeholder="Présentez votre entreprise…" required />
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95 h-12">
          {saving ? <Loader2 className="animate-spin" size={16} /> : "Enregistrer et continuer"}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Les champs marqués * sont obligatoires. Le portfolio, bio et autres détails se complètent depuis « Modifier le profil ».
        </p>
      </form>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{props.label}</label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function TextArea(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        maxLength={500}
        required={props.required}
        className="w-full h-24 p-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function CategoryPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{label ?? "Catégorie"}</label>
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {categoryList.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onChange(c.name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              value === c.name ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
