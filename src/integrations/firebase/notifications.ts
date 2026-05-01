/**
 * Notifications service — stored as Firestore documents per user.
 *
 * Collection: `notifications`
 * Document shape:
 *   {
 *     userId: string,         // recipient
 *     type: "request"|"quote"|"promo"|"system",
 *     icon: string,
 *     title: string,
 *     message: string,
 *     urgent: boolean,
 *     read: boolean,
 *     link?: string,          // deep link path (e.g. /pro, /worker/xxx)
 *     meta?: Record<string, unknown>,
 *     createdAt: Timestamp,
 *   }
 *
 * All functions degrade to no-op / [] when Firebase isn't configured.
 */
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  limit as fbLimit,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./client";

export interface AppNotification {
  id: string;
  userId: string;
  type: "request" | "quote" | "promo" | "system";
  icon: string;
  title?: string;
  message: string;
  urgent: boolean;
  read: boolean;
  link?: string;
  meta?: Record<string, unknown>;
  createdAtMs: number;
}

export interface CreateNotificationInput {
  userId: string;
  type: AppNotification["type"];
  icon: string;
  title?: string;
  message: string;
  urgent?: boolean;
  link?: string;
  meta?: Record<string, unknown>;
}

function toMs(v: unknown): number {
  if (!v) return Date.now();
  if (typeof v === "object" && v !== null && "toMillis" in v) {
    try { return (v as { toMillis: () => number }).toMillis(); } catch { return Date.now(); }
  }
  return Date.now();
}

/** Subscribe to a user's notifications (realtime). Returns unsubscribe fn. */
export function subscribeToUserNotifications(
  userId: string,
  cb: (list: AppNotification[]) => void,
): Unsubscribe {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(getDb(), "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    fbLimit(50),
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: AppNotification[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          userId: String(data.userId ?? ""),
          type: (data.type as AppNotification["type"]) ?? "system",
          icon: String(data.icon ?? "🔔"),
          title: data.title as string | undefined,
          message: String(data.message ?? ""),
          urgent: Boolean(data.urgent),
          read: Boolean(data.read),
          link: data.link as string | undefined,
          meta: data.meta as Record<string, unknown> | undefined,
          createdAtMs: toMs(data.createdAt),
        };
      });
      cb(list);
    },
    (err) => {
      console.warn("subscribeToUserNotifications error", err);
      cb([]);
    },
  );
}

export async function createNotification(input: CreateNotificationInput): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const ref = await addDoc(collection(getDb(), "notifications"), {
      ...input,
      urgent: input.urgent ?? false,
      read: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.warn("createNotification failed", e);
    return null;
  }
}

/** Bulk create — used when a request is sent to multiple pros. */
export async function createNotificationsBulk(items: CreateNotificationInput[]): Promise<number> {
  if (!isFirebaseConfigured || items.length === 0) return 0;
  try {
    const db = getDb();
    const batch = writeBatch(db);
    for (const item of items) {
      const ref = doc(collection(db, "notifications"));
      batch.set(ref, { ...item, urgent: item.urgent ?? false, read: false, createdAt: serverTimestamp() });
    }
    await batch.commit();
    return items.length;
  } catch (e) {
    console.warn("createNotificationsBulk failed", e);
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await updateDoc(doc(getDb(), "notifications", id), { read: true });
  } catch (e) {
    console.warn("markNotificationRead", e);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const snap = await getDocs(
      query(collection(getDb(), "notifications"), where("userId", "==", userId), where("read", "==", false)),
    );
    const batch = writeBatch(getDb());
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch (e) {
    console.warn("markAllNotificationsRead", e);
  }
}

/**
 * Find pros (workers/companies) that should receive a notification.
 * Strategy: fetch from `workers` and `companies` collections filtered by category,
 * optionally further filtered by city for "proximity" mode.
 * Falls back to bundled static data when Firebase isn't available.
 */
export async function findProsForRequest(opts: {
  category: string;
  city?: string | null;
  proximity: boolean;
}): Promise<{ uid: string; kind: "worker" | "company" }[]> {
  const { category, city, proximity } = opts;
  if (!isFirebaseConfigured) {
    // Static fallback so seed data still receives demo notifications
    const { workers } = await import("@/data/workers");
    const { companies } = await import("@/data/companies");
    const ws = workers
      .filter((w) => w.category === category && (!proximity || !city || w.city === city))
      .map((w) => ({ uid: w.id, kind: "worker" as const }));
    const cs = companies
      .filter((c) => c.category === category && (!proximity || !city || c.city === city))
      .map((c) => ({ uid: c.id, kind: "company" as const }));
    return [...ws, ...cs];
  }
  try {
    const db = getDb();
    const wq = query(collection(db, "workers"), where("category", "==", category));
    const cq = query(collection(db, "companies"), where("category", "==", category));
    const [ws, cs] = await Promise.all([getDocs(wq), getDocs(cq)]);
    const filterCity = (data: Record<string, unknown>) =>
      !proximity || !city || data.city === city;
    return [
      ...ws.docs
        .filter((d) => filterCity(d.data() as Record<string, unknown>))
        .map((d) => ({ uid: (d.data() as { ownerUid?: string }).ownerUid ?? d.id, kind: "worker" as const })),
      ...cs.docs
        .filter((d) => filterCity(d.data() as Record<string, unknown>))
        .map((d) => ({ uid: (d.data() as { ownerUid?: string }).ownerUid ?? d.id, kind: "company" as const })),
    ];
  } catch (e) {
    console.warn("findProsForRequest", e);
    return [];
  }
}
