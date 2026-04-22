/**
 * useGeolocation — récupère la position GPS du navigateur et la convertit
 * en nom de ville via Nominatim (OpenStreetMap, gratuit, sans clé API).
 *
 * Retourne `{ city, loading, error }`. La position est mise en cache dans
 * localStorage (1h) pour éviter de redemander à chaque rendu.
 */
import { useEffect, useState } from "react";

interface GeoState {
  city: string | null;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = "tc.geo.city";
const CACHE_MS = 60 * 60 * 1000; // 1h

interface CacheEntry {
  city: string;
  ts: number;
}

function readCache(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts > CACHE_MS) return null;
    return parsed.city;
  } catch {
    return null;
  }
}

function writeCache(city: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ city, ts: Date.now() } as CacheEntry));
  } catch {
    /* ignore */
  }
}

export function useGeolocation(fallback = "Tunis, Tunisie"): GeoState {
  const [state, setState] = useState<GeoState>(() => {
    const cached = readCache();
    return { city: cached, loading: !cached, error: null };
  });

  useEffect(() => {
    if (state.city) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ city: fallback, loading: false, error: "geo-unavailable" });
      return;
    }

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`,
            { headers: { Accept: "application/json" } },
          );
          const data = (await res.json()) as {
            address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
          };
          if (cancelled) return;
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            fallback;
          const country = data.address?.country ?? "Tunisie";
          const label = `${city}, ${country}`;
          writeCache(label);
          setState({ city: label, loading: false, error: null });
        } catch {
          if (!cancelled) setState({ city: fallback, loading: false, error: "reverse-failed" });
        }
      },
      () => {
        if (!cancelled) setState({ city: fallback, loading: false, error: "denied" });
      },
      { enableHighAccuracy: false, maximumAge: CACHE_MS, timeout: 8000 },
    );

    return () => {
      cancelled = true;
    };
  }, [state.city, fallback]);

  return state;
}
