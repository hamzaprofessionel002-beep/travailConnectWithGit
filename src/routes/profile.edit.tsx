import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2, ImagePlus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type UserRole } from "@/integrations/firebase/auth-context";
import { firebaseErrorToMessage } from "@/integrations/firebase/errors";
import { uploadImage, uploadMedia, isCloudinaryConfigured } from "@/integrations/cloudinary/upload";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/useT";
import { categoryList } from "@/data/workers";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfilePage,
  head: () => ({ meta: [{ title: "Modifier le profil — Travail Connect" }] }),
});

function EditProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  // Worker fields
  const [profession, setProfession] = useState("");
  const [category, setCategory] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experience, setExperience] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [available, setAvailable] = useState(true);

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [description, setDescription] = useState("");

  // Portfolio (images + videos URLs)
  const [portfolio, setPortfolio] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (auth.profile) {
      const p = auth.profile;
      setDisplayName(p.displayName ?? "");
      setPhone(p.phone ?? "");
      setCity(p.city ?? "");
      setRole(p.role ?? "client");
      setAvatar(p.avatar ?? null);
      setBio(p.bio ?? "");
      setProfession(p.profession ?? "");
      setCategory(p.category ?? "");
      setHourlyRate(p.hourlyRate ? String(p.hourlyRate) : "");
      setExperience(p.experience ? String(p.experience) : "");
      setSkillsText((p.skills ?? []).join(", "));
      setAvailable(p.available ?? true);
      setCompanyName(p.companyName ?? "");
      setTeamSize(p.teamSize ? String(p.teamSize) : "");
      setYearsExperience(p.yearsExperience ? String(p.yearsExperience) : "");
      setResponseTime(p.responseTime ?? "");
      setPriceRange(p.priceRange ?? "");
      setDescription(p.description ?? "");
      setPortfolio(p.portfolio ?? []);
    }
  }, [auth.profile]);

  if (auth.ready && !auth.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">Vous devez être connecté pour modifier votre profil.</p>
        <Link to="/login" className="px-4 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold">
          Se connecter
        </Link>
      </div>
    );
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, { folder: "avatars" });
      setAvatar(result.url);
      toast.success("Avatar téléchargé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du téléchargement");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handlePortfolioAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 10 - portfolio.length)) {
        const r = await uploadMedia(f, { folder: "portfolio" });
        urls.push(r.url);
      }
      setPortfolio((p) => [...p, ...urls]);
      if (urls.length) toast.success(`${urls.length} média(s) ajouté(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);

      await auth.updateUserProfile({
        displayName: displayName.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        role,
        avatar,
        bio: bio.trim() || null,
        profession: role === "worker" ? profession.trim() || null : null,
        category: category.trim() || null,
        hourlyRate: role === "worker" && hourlyRate ? Number(hourlyRate) : null,
        experience: role === "worker" && experience ? Number(experience) : null,
        skills: role === "worker" ? skills : [],
        available: role === "worker" ? available : true,
        companyName: role === "company" ? companyName.trim() || null : null,
        teamSize: role === "company" && teamSize ? Number(teamSize) : null,
        yearsExperience: role === "company" && yearsExperience ? Number(yearsExperience) : null,
        responseTime: role === "company" ? responseTime.trim() || null : null,
        priceRange: role === "company" ? priceRange.trim() || null : null,
        description: role === "company" ? description.trim() || null : null,
        portfolio,
      });
      toast.success(t("edit.saved"));
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">{t("edit.title")}</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        {!isCloudinaryConfigured && (
          <div className="p-3 rounded-xl bg-accent/40 border border-accent text-xs text-accent-foreground">
            Cloudinary n'est pas configuré : l'upload est désactivé. Ajoutez <code>VITE_CLOUDINARY_*</code> dans <code>.env</code>.
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatar ?? "https://api.dicebear.com/9.x/personas/svg?seed=guest"}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl object-cover bg-secondary border-2 border-border"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || !isCloudinaryConfigured}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center tc-shadow-brand active:scale-95 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={16} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP — 8 MB max</p>
        </div>

        {/* Basics */}
        <Section title={t("edit.basics")}>
          <Field label={t("edit.name")} value={displayName} onChange={setDisplayName} required />
            <Field label="Email" type="email" value={auth.profile?.email ?? auth.user?.email ?? ""} onChange={() => {}} disabled />
          <Field label={`${t("edit.phone")} · ${t("common.optional")}`} type="tel" value={phone} onChange={setPhone} placeholder="+216 …" />
          <Field label={`${t("edit.city")} · ${t("common.optional")}`} value={city} onChange={setCity} placeholder="Tunis" />

          <div>
            <label className="text-xs font-semibold mb-1.5 block">{t("edit.role")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["client", "worker", "company"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    role === r ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  {r === "client" ? "👤 Client" : r === "worker" ? "👷 Artisan" : "🏢 Entreprise"}
                </button>
              ))}
            </div>
          </div>

          <TextArea label={`${t("edit.bio")} · ${t("common.optional")}`} value={bio} onChange={setBio} placeholder={t("edit.bioPlaceholder")} />
        </Section>

        {/* Worker fields */}
        {role === "worker" && (
          <Section title={`👷 ${t("edit.pro")}`}>
            <Field label={t("edit.profession")} value={profession} onChange={setProfession} placeholder="Ex : Plombier" />
            <CategoryPicker value={category} onChange={setCategory} />
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("edit.hourlyRate")} type="number" value={hourlyRate} onChange={setHourlyRate} placeholder="40" />
              <Field label={t("edit.experience")} type="number" value={experience} onChange={setExperience} placeholder="5" />
            </div>
            <Field label={t("edit.skills")} value={skillsText} onChange={setSkillsText} placeholder="Réparation fuites, Tuyauterie, Chauffe-eau" />
            <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium">{t("edit.available")}</span>
            </label>
          </Section>
        )}

        {/* Company fields */}
        {role === "company" && (
          <Section title={`🏢 ${t("edit.pro")}`}>
            <Field label={t("edit.companyName")} value={companyName} onChange={setCompanyName} placeholder="ProPeinture Tunisie" />
            <CategoryPicker value={category} onChange={setCategory} />
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("edit.teamSize")} type="number" value={teamSize} onChange={setTeamSize} placeholder="10" />
              <Field label="Années d'expérience" type="number" value={yearsExperience} onChange={setYearsExperience} placeholder="8" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("edit.responseTime")} value={responseTime} onChange={setResponseTime} placeholder="< 1h" />
              <Field label="Téléphone public" type="tel" value={phone} onChange={setPhone} placeholder="+216 …" />
            </div>
            <Field label={t("edit.priceRange")} value={priceRange} onChange={setPriceRange} placeholder="50-150 DT/jour" />
            <TextArea label={t("edit.description")} value={description} onChange={setDescription} placeholder="Présentez votre entreprise…" />
          </Section>
        )}

        {/* Portfolio (worker + company) */}
        {(role === "worker" || role === "company") && (
          <Section title={`🖼️ ${t("edit.portfolio")}`}>
            <div className="grid grid-cols-3 gap-2">
              {portfolio.map((url, i) => {
                const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/");
                return (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                    {isVideo ? (
                      <>
                        <video src={url} className="w-full h-full object-cover" muted playsInline />
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-foreground/70 text-card text-[9px] font-semibold flex items-center gap-0.5">
                          <Video size={9} /> Vidéo
                        </span>
                      </>
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setPortfolio((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-card/90 active:scale-90 transition-transform"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
              {portfolio.length < 10 && (
                <label className={`aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-95 transition-transform cursor-pointer ${uploadingMedia || !isCloudinaryConfigured ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingMedia ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                  <span className="text-[10px] text-center px-1">{uploadingMedia ? "…" : t("edit.addMedia")}</span>
                  <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handlePortfolioAdd(e.target.files)} />
                </label>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Photos (max 8MB) ou vidéos (max 50MB), jusqu'à 10 médias.</p>
          </Section>
        )}

        <Button type="submit" disabled={saving || uploading || uploadingMedia} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95">
          {saving ? <Loader2 className="animate-spin" size={16} /> : t("common.save")}
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wide">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{props.label}</label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        disabled={props.disabled}
        className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function TextArea(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        maxLength={500}
        className="w-full h-24 p-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function CategoryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">Catégorie</label>
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
