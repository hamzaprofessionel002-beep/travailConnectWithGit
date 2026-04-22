import { X, Phone, MessageCircle } from "lucide-react";
import { useT } from "@/i18n/useT";
import { tunisianPhoneRegex } from "@/lib/validation";

interface ContactModalProps {
  name: string;
  phone: string;
  onClose: () => void;
}

export function ContactModal({ name, phone, onClose }: ContactModalProps) {
  const t = useT();

  // Validate phone before exposing href to prevent injection into tel:/wa.me URLs.
  const isValidPhone = tunisianPhoneRegex.test(phone.trim());
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const waPhone = phone.replace(/[^\d]/g, "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {t("contact.title")} {name}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary" aria-label={t("common.cancel")}>
            <X size={20} />
          </button>
        </div>
        {!isValidPhone ? (
          <p className="text-sm text-muted-foreground py-4">Numéro de téléphone indisponible.</p>
        ) : (
          <div className="space-y-3">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-tc-green/10 text-tc-green font-medium active:scale-[0.98] transition-transform"
            >
              <Phone size={20} />
              <div>
                <p className="text-sm font-semibold">{t("contact.call")}</p>
                <p className="text-xs opacity-80">{phone}</p>
              </div>
            </a>
            <a
              href={`https://wa.me/${encodeURIComponent(waPhone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-tc-green/10 text-tc-green font-medium active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={20} />
              <div>
                <p className="text-sm font-semibold">{t("contact.whatsapp")}</p>
                <p className="text-xs opacity-80">{t("contact.whatsappMsg")}</p>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
