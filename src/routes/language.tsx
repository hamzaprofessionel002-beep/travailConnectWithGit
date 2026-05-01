import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/language")({
  component: LanguagePage,
  head: () => ({
    meta: [{ title: "Langue — Travail Connect" }],
  }),
});

function LanguagePage() {
  const { language, setLanguage } = useAppStore();

  const langs = [
    { code: "fr" as const, label: "Français", flag: "🇫🇷" },
    { code: "ar" as const, label: "العربية", flag: "🇹🇳" },
  ];

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link to="/profile" className="p-1 -ml-1"><ArrowLeft size={22} /></Link>
          <h1 className="text-lg font-bold flex-1">🌍 Langue</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-2">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all active:scale-[0.98] ${
              language === l.code ? "bg-primary/10 border-2 border-primary" : "bg-card tc-shadow-card border-2 border-transparent"
            }`}
          >
            <span className="text-2xl">{l.flag}</span>
            <span className="flex-1 text-left text-sm font-medium">{l.label}</span>
            {language === l.code && <Check size={20} className="text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
