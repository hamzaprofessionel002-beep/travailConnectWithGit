/**
 * Firestore data services — requests, quotes, profiles, workers, companies.
 *
 * Each helper is small and isolated so the rest of the app can stay
 * unchanged. Workers/companies use a hybrid strategy: try Firestore first,
 * fallback to bundled static data so the UI never breaks.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  orderBy,
  limit as fbLimit,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./client";
import { workers as staticWorkers, type Worker } from "@/data/workers";
import { companies as staticCompanies, type Company } from "@/data/companies";

// ─────────────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────────────
export interface RequestInput {
  category: string;
  city: string;
  description: string;
  urgency: "urgent" | "normal";
  phone: string;
  userId?: string | null;
  photos?: string[];
}

export async function createRequest(input: RequestInput): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase n'est pas configuré : la demande n'a pas pu être enregistrée.");
  }
  const ref = await addDoc(collection(getDb(), "requests"), {
    ...input,
    photos: input.photos ?? [],
    status: "open",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─────────────────────────────────────────────────────────────────────
// Quotes (with photo attachments)
// ─────────────────────────────────────────────────────────────────────
export interface QuoteInput {
  targetType: "worker" | "company";
  targetId: string;
  targetName: string;
  description: string;
  userId?: string | null;
  userName?: string | null;
  userPhone?: string | null;
  photos?: string[];
}

export async function createQuote(input: QuoteInput): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase n'est pas configuré : le devis n'a pas pu être envoyé.");
  }
  const ref = await addDoc(collection(getDb(), "quotes"), {
    ...input,
    photos: input.photos ?? [],
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─────────────────────────────────────────────────────────────────────
// Workers/Companies — hybrid (Firestore first, static fallback)
// ─────────────────────────────────────────────────────────────────────

/** Returns Firestore workers merged with the static seed (Firestore wins). */
export async function fetchWorkers(): Promise<Worker[]> {
  if (!isFirebaseConfigured) return staticWorkers;
  try {
    const snap = await getDocs(collection(getDb(), "workers"));
    if (snap.empty) return staticWorkers;
    const remote = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Worker, "id">) }));
    const map = new Map<string, Worker>();
    for (const w of staticWorkers) map.set(w.id, w);
    for (const w of remote) map.set(w.id, w as Worker);
    return Array.from(map.values());
  } catch (err) {
    console.warn("fetchWorkers fallback to static:", err);
    return staticWorkers;
  }
}

export async function fetchCompanies(): Promise<Company[]> {
  if (!isFirebaseConfigured) return staticCompanies;
  try {
    const snap = await getDocs(collection(getDb(), "companies"));
    if (snap.empty) return staticCompanies;
    const remote = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Company, "id">) }));
    const map = new Map<string, Company>();
    for (const c of staticCompanies) map.set(c.id, c);
    for (const c of remote) map.set(c.id, c as Company);
    return Array.from(map.values());
  } catch (err) {
    console.warn("fetchCompanies fallback to static:", err);
    return staticCompanies;
  }
}

export async function fetchWorkerById(id: string): Promise<Worker | null> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(getDb(), "workers", id));
      if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<Worker, "id">) };
    } catch (err) {
      console.warn("fetchWorkerById fallback to static:", err);
    }
  }
  return staticWorkers.find((w) => w.id === id) ?? null;
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(getDb(), "companies", id));
      if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<Company, "id">) };
    } catch (err) {
      console.warn("fetchCompanyById fallback to static:", err);
    }
  }
  return staticCompanies.find((c) => c.id === id) ?? null;
}

/** Save (create or update) a worker doc in Firestore (id = doc id). */
export async function upsertWorker(worker: Worker): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase non configuré.");
  await setDoc(doc(getDb(), "workers", worker.id), worker, { merge: true });
}

export async function upsertCompany(company: Company): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase non configuré.");
  await setDoc(doc(getDb(), "companies", company.id), company, { merge: true });
}

export async function deleteWorker(id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(getDb(), "workers", id));
}
export async function deleteCompany(id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(getDb(), "companies", id));
}

// ─────────────────────────────────────────────────────────────────────
// Quotes/Requests by user
// ─────────────────────────────────────────────────────────────────────
export async function fetchUserRequests(userId: string) {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(query(collection(getDb(), "requests"), where("userId", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("fetchUserRequests", e);
    return [];
  }
}

export async function fetchRequestsForPro(opts: { category?: string | null; city?: string | null; limit?: number } = {}) {
  if (!isFirebaseConfigured) return [];
  try {
    const ref = collection(getDb(), "requests");
    const clauses = [];
    if (opts.category) clauses.push(where("category", "==", opts.category));
    if (opts.city) clauses.push(where("city", "==", opts.city));
    clauses.push(orderBy("createdAt", "desc"));
    clauses.push(fbLimit(opts.limit ?? 20));
    const snap = await getDocs(query(ref, ...clauses));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; [k: string]: unknown }));
  } catch (e) {
    console.warn("fetchRequestsForPro", e);
    return [];
  }
}

export async function fetchUserQuotes(userId: string) {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(query(collection(getDb(), "quotes"), where("userId", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("fetchUserQuotes", e);
    return [];
  }
}

export async function fetchQuotesForTarget(targetType: "worker" | "company", targetId: string) {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(
      query(
        collection(getDb(), "quotes"),
        where("targetType", "==", targetType),
        where("targetId", "==", targetId),
      ),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; [k: string]: unknown }));
  } catch (e) {
    console.warn("fetchQuotesForTarget", e);
    return [];
  }
}

/** Generic helper (used by the seed script + admin tooling). */
export async function listCollection<T = DocumentData>(
  name: string,
  opts: { limit?: number; orderField?: string; whereClauses?: [string, "==" | ">" | "<" | ">=" | "<=", unknown][] } = {},
): Promise<T[]> {
  if (!isFirebaseConfigured) return [];
  const ref = collection(getDb(), name);
  const clauses = [];
  if (opts.whereClauses) for (const w of opts.whereClauses) clauses.push(where(w[0], w[1], w[2]));
  if (opts.orderField) clauses.push(orderBy(opts.orderField));
  if (opts.limit) clauses.push(fbLimit(opts.limit));
  const q = clauses.length ? query(ref, ...clauses) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}
