import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Send, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { quoteSchema, type QuoteFormData } from "@/lib/validation";
import { useT } from "@/i18n/useT";
import { useAppStore } from "@/store/useAppStore";
import { createQuote } from "@/integrations/firebase/services";
import { firebaseErrorToMessage } from "@/integrations/firebase/errors";
import { uploadImage, isCloudinaryConfigured } from "@/integrations/cloudinary/upload";

interface QuoteModalProps {
  name: string;
  targetType?: "worker" | "company";
  targetId?: string;
  onClose: () => void;
}

export function QuoteModal({ name, targetType = "worker", targetId = "unknown", onClose }: QuoteModalProps) {
  const t = useT();
  const { userId, userName, userPhone } = useAppStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    mode: "onBlur",
  });

  async function handleAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 5 - photos.length)) {
        const r = await uploadImage(f, { folder: "quotes" });
        urls.push(r.url);
      }
      setPhotos((p) => [...p, ...urls]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await createQuote({
        targetType,
        targetId,
        targetName: name,
        description: data.description,
        userId: userId ?? null,
        userName: userName || null,
        userPhone: userPhone || null,
        photos,
      });
      toast.success(`${t("quote.sent")} ${name}`);
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t("quote.title")}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary" aria-label={t("common.cancel")}>
            <X size={20} />
          </button>
        </div>
        {isSubmitSuccessful ? (
          <div className="text-center py-8">
            <span className="text-4xl">✅</span>
            <p className="mt-2 font-medium">{t("quote.sent")} {name} !</p>
            <p className="text-sm text-muted-foreground mt-1">{t("quote.sentHint")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("quote.describe")} <strong>{name}</strong>
            </p>
            <textarea
              {...register("description")}
              placeholder={t("quote.placeholder")}
              maxLength={1000}
              className={`w-full h-28 p-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 ${
                errors.description ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/30"
              }`}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {t(errors.description.message as Parameters<typeof t>[0])}
              </p>
            )}

            {/* Photos */}
            <div>
              <label className="text-xs font-semibold mb-1 block">{t("quote.addPhotos")}</label>
              <p className="text-[11px] text-muted-foreground mb-2">{t("quote.addPhotosHint")}</p>
              {!isCloudinaryConfigured && (
                <p className="text-[11px] text-muted-foreground mb-2">
                  Cloudinary non configuré : ajout de photos désactivé.
                </p>
              )}
              <div className="grid grid-cols-4 gap-2">
                {photos.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-card/90 active:scale-90 transition-transform"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label
                    className={`aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-95 transition-transform cursor-pointer ${
                      uploading || !isCloudinaryConfigured ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                    <span className="text-[10px]">{uploading ? t("quote.uploading") : t("common.add")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAddPhotos(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting || uploading}>
              <Send size={16} /> {t("quote.send")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
