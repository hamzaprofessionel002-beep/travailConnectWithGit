import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Send, Zap, Clock, Search, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestSchema, type RequestFormData } from "@/lib/validation";
import { useT } from "@/i18n/useT";
import { useAppStore } from "@/store/useAppStore";
import { categoryList } from "@/data/workers";
import { createRequest } from "@/integrations/firebase/services";
import { firebaseErrorToMessage } from "@/integrations/firebase/errors";
import { uploadImage, isCloudinaryConfigured } from "@/integrations/cloudinary/upload";

interface RequestModalProps {
  onClose: () => void;
}

export function RequestModal({ onClose }: RequestModalProps) {
  const t = useT();
  const { userPhone, userCity, userId } = useAppStore();
  const [showAllCats, setShowAllCats] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    mode: "onBlur",
    defaultValues: {
      urgency: "normal",
      phone: userPhone || "",
      city: userCity || "",
      category: "",
      description: "",
    },
  });

  const urgency = watch("urgency");
  const category = watch("category");

  const filteredCats = categoryList.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  async function handleAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 5 - photos.length)) {
        const r = await uploadImage(f, { folder: "requests" });
        urls.push(r.url);
      }
      setPhotos((p) => [...p, ...urls]);
      if (urls.length) toast.success(`${urls.length} photo(s) ajoutée(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = async (data: RequestFormData) => {
    try {
      await createRequest({ ...data, userId: userId ?? null, photos });
      toast.success(t("request.sent"), { description: t("request.sentHint") });
      setTimeout(onClose, 1200);
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg">{t("request.title")}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary" aria-label={t("common.cancel")}>
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("request.subtitle")}</p>

        {isSubmitSuccessful ? (
          <div className="text-center py-8">
            <span className="text-5xl">✅</span>
            <p className="mt-3 font-semibold">{t("request.sent")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("request.sentHint")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            {/* Urgency */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">{t("request.urgency")}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue("urgency", "urgent", { shouldValidate: true })}
                  className={`p-3 rounded-xl border-2 text-start transition-all active:scale-[0.98] ${
                    urgency === "urgent" ? "border-destructive bg-destructive/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <Zap size={14} className="text-destructive" /> {t("request.urgent")}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("request.urgentHint")}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("urgency", "normal", { shouldValidate: true })}
                  className={`p-3 rounded-xl border-2 text-start transition-all active:scale-[0.98] ${
                    urgency === "normal" ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <Clock size={14} className="text-primary" /> {t("request.normal")}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("request.normalHint")}</p>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold">{t("request.category")}</label>
                <button
                  type="button"
                  onClick={() => setShowAllCats(true)}
                  className="text-xs text-primary font-medium"
                >
                  {t("request.seeAllCategories")}
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                {categoryList.slice(0, 6).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setValue("category", c.name, { shouldValidate: true })}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      category === c.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
              {category && !categoryList.slice(0, 6).find((c) => c.name === category) && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Sélectionné : <span className="font-semibold text-foreground">{category}</span>
                </p>
              )}
              {errors.category && (
                <p className="text-xs text-destructive mt-1">
                  {t(errors.category.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">{t("request.city")}</label>
              <input
                {...register("city")}
                placeholder={t("request.cityPlaceholder")}
                className={`w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 ${
                  errors.city ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/30"
                }`}
              />
              {errors.city && (
                <p className="text-xs text-destructive mt-1">
                  {t(errors.city.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">{t("request.description")}</label>
              <textarea
                {...register("description")}
                placeholder={t("request.descPlaceholder")}
                maxLength={1000}
                className={`w-full h-24 p-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 ${
                  errors.description ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/30"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {t(errors.description.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            {/* Photos */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">{t("request.addPhotos")}</label>
              <PhotoPicker
                photos={photos}
                onAdd={handleAddPhotos}
                onRemove={(i) => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                uploading={uploading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">{t("request.phone")}</label>
              <input
                {...register("phone")}
                type="tel"
                inputMode="tel"
                placeholder={t("request.phonePlaceholder")}
                className={`w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 ${
                  errors.phone ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/30"
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">
                  {t(errors.phone.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2 bg-gradient-brand text-primary-foreground hover:opacity-95"
              disabled={isSubmitting || uploading}
            >
              <Send size={16} /> {t("request.submit")}
            </Button>
          </form>
        )}

        {/* All-categories overlay */}
        {showAllCats && (
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 backdrop-blur-sm"
            onClick={() => setShowAllCats(false)}
          >
            <div
              className="w-full max-w-lg bg-card rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold">{t("request.category")}</h4>
                <button onClick={() => setShowAllCats(false)} className="p-1 rounded-full hover:bg-secondary">
                  <X size={20} />
                </button>
              </div>
              <div className="relative mb-3">
                <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder={t("request.searchCategory")}
                  className="w-full h-10 ps-9 pe-3 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredCats.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setValue("category", c.name, { shouldValidate: true });
                      setShowAllCats(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      category === c.name ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </button>
                ))}
                {filteredCats.length === 0 && (
                  <p className="col-span-2 text-center text-xs text-muted-foreground py-6">
                    {t("common.noResults")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoPicker(props: {
  photos: string[];
  onAdd: (files: FileList | null) => void;
  onRemove: (i: number) => void;
  uploading: boolean;
}) {
  return (
    <div>
      {!isCloudinaryConfigured && (
        <p className="text-[11px] text-muted-foreground mb-2">
          Cloudinary non configuré : ajout de photos désactivé.
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {props.photos.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => props.onRemove(i)}
              className="absolute top-1 right-1 p-1 rounded-full bg-card/90 active:scale-90 transition-transform"
              aria-label="remove"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {props.photos.length < 5 && (
          <label
            className={`aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-95 transition-transform cursor-pointer ${
              props.uploading || !isCloudinaryConfigured ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {props.uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-[10px]">{props.uploading ? "…" : "Ajouter"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => props.onAdd(e.target.files)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
