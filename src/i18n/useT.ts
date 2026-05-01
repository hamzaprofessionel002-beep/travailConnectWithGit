import { useAppStore } from "@/store/useAppStore";
import { translations, type Locale, type TranslationKeys } from "./translations";

type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}.${Path<T[K]>}`
    : K
  : never;

export type TKey = Path<TranslationKeys>;

function getValue(obj: unknown, path: string): string {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string ?? path;
}

/**
 * Translation hook. Usage: const t = useT(); t("nav.home")
 * RTL: only the layout direction flips for AR (handled in __root.tsx).
 * Text content stays readable in its native script.
 */
export function useT() {
  const language = useAppStore((s) => s.language) as Locale;
  return (key: TKey): string => getValue(translations[language] ?? translations.fr, key);
}

export function useLocale(): Locale {
  return useAppStore((s) => s.language) as Locale;
}

export function useIsRTL(): boolean {
  return useAppStore((s) => s.language) === "ar";
}
