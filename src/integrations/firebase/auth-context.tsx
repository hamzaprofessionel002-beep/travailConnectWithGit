/**
 * Auth context — wraps Firebase Auth with React-friendly state and
 * exposes login/signup/logout helpers (Email, Google, Phone).
 *
 * Profile schema is intentionally permissive: only `displayName` is
 * required at signup. Workers/companies can fill the rest later from
 * the edit screen.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getDb, isFirebaseConfigured } from "./client";

export type UserRole = "client" | "worker" | "company";

export interface AuthProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  city: string | null;
  role: UserRole;
  avatar: string | null;

  // Optional extended fields (workers + companies fill these later).
  bio: string | null;
  category: string | null;
  profession: string | null;            // worker only
  hourlyRate: number | null;            // worker only
  experience: number | null;            // worker only (years)
  skills: string[];                     // worker only
  available: boolean;                   // worker only

  companyName: string | null;           // company only
  teamSize: number | null;              // company only
  yearsExperience: number | null;       // company only
  responseTime: string | null;          // company only
  priceRange: string | null;            // company only
  description: string | null;           // company only
  portfolio: string[];                  // both (image/video URLs)

  // Privacy settings
  showPhone: boolean;
  showLocation: boolean;
  showEmail: boolean;
  acceptNotifications: boolean;
}

export interface SignUpExtras {
  name?: string;
  role?: UserRole;
  phone?: string;
  city?: string;
}

interface AuthCtx {
  ready: boolean;
  user: User | null;
  profile: AuthProfile | null;
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, extras: SignUpExtras) => Promise<void>;
  signInWithGoogle: (defaults?: SignUpExtras) => Promise<void>;
  startPhoneSignIn: (phoneE164: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  confirmPhoneCode: (confirmation: ConfirmationResult, code: string, defaults?: SignUpExtras) => Promise<void>;
  updateUserProfile: (patch: Partial<Omit<AuthProfile, "uid" | "email">>) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function emptyProfile(user: User, defaults?: Partial<AuthProfile>): AuthProfile {
  return {
    uid: user.uid,
    email: user.email,
    displayName: defaults?.displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "Utilisateur",
    phone: defaults?.phone ?? user.phoneNumber ?? null,
    city: defaults?.city ?? null,
    role: defaults?.role ?? "client",
    avatar: defaults?.avatar ?? user.photoURL ?? null,
    bio: defaults?.bio ?? null,
    category: defaults?.category ?? null,
    profession: defaults?.profession ?? null,
    hourlyRate: defaults?.hourlyRate ?? null,
    experience: defaults?.experience ?? null,
    skills: defaults?.skills ?? [],
    available: defaults?.available ?? true,
    companyName: defaults?.companyName ?? null,
    teamSize: defaults?.teamSize ?? null,
    yearsExperience: defaults?.yearsExperience ?? null,
    responseTime: defaults?.responseTime ?? null,
    priceRange: defaults?.priceRange ?? null,
    description: defaults?.description ?? null,
    portfolio: defaults?.portfolio ?? [],
    showPhone: defaults?.showPhone ?? true,
    showLocation: defaults?.showLocation ?? true,
    showEmail: defaults?.showEmail ?? false,
    acceptNotifications: defaults?.acceptNotifications ?? true,
  };
}

async function ensureProfile(user: User, defaults?: Partial<AuthProfile>): Promise<AuthProfile> {
  const ref = doc(getDb(), "profiles", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as Omit<AuthProfile, "uid">;
    return { ...emptyProfile(user), ...data, uid: user.uid };
  }
  const fresh = emptyProfile(user, defaults);
  const { uid: _uid, ...rest } = fresh;
  await setDoc(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return fresh;
}

/**
 * Mirror a profile into the public `workers` / `companies` collections so
 * that artisans/companies who finish their pro profile become discoverable
 * everywhere in the app (Home, Browse, Entreprises, detail pages).
 *
 * - Only runs for `worker` and `company` roles
 * - Cleans up the opposite collection if the user changes role
 * - System-managed fields (rating, reviewsCount, verified) start at 0/false
 */
async function syncPublicListing(p: AuthProfile): Promise<void> {
  const db = getDb();
  if (p.role === "worker") {
    if (!p.displayName || !p.profession || !p.category) return;
    const workerDoc = {
      id: p.uid,
      name: p.displayName,
      profession: p.profession,
      category: p.category,
      city: p.city ?? "Tunisie",
      rating: 0,
      reviewsCount: 0,
      experience: p.experience ?? 0,
      hourlyRate: p.hourlyRate ?? 0,
      available: p.available ?? true,
      verified: false,
      phone: p.phone ?? "",
      avatar: p.avatar ?? `https://api.dicebear.com/9.x/personas/svg?seed=${p.uid}`,
      skills: p.skills ?? [],
      portfolio: p.portfolio ?? [],
      bio: p.bio ?? "",
      ownerUid: p.uid,
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "workers", p.uid), workerDoc, { merge: true });
    try { const { deleteDoc } = await import("firebase/firestore"); await deleteDoc(doc(db, "companies", p.uid)); } catch { /* ignore */ }
  } else if (p.role === "company") {
    if (!p.companyName || !p.category) return;
    const companyDoc = {
      id: p.uid,
      name: p.companyName,
      logo: p.avatar ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.companyName)}`,
      cover: (p.portfolio ?? [])[0] ?? `https://picsum.photos/seed/${p.uid}/800/400`,
      category: p.category,
      city: p.city ?? "Tunisie",
      rating: 0,
      reviewsCount: 0,
      yearsExperience: p.yearsExperience ?? 0,
      teamSize: p.teamSize ?? 1,
      available: true,
      responseTime: p.responseTime ?? "—",
      priceRange: p.priceRange ?? "—",
      verified: false,
      phone: p.phone ?? "",
      description: p.description ?? "",
      services: [],
      portfolio: p.portfolio ?? [],
      ownerUid: p.uid,
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "companies", p.uid), companyDoc, { merge: true });
    try { const { deleteDoc } = await import("firebase/firestore"); await deleteDoc(doc(db, "workers", p.uid)); } catch { /* ignore */ }
  } else {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "workers", p.uid));
      await deleteDoc(doc(db, "companies", p.uid));
    } catch { /* ignore */ }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isFirebaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const pendingDefaults = useRef<SignUpExtras | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await ensureProfile(u, pendingDefaults.current ?? undefined);
          pendingDefaults.current = null;
          setProfile(p);
        } catch (e) {
          console.error("ensureProfile failed", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const value = useMemo<AuthCtx>(() => {
    const guard = () => {
      if (!isFirebaseConfigured) {
        throw new Error("Firebase n'est pas configuré. Créez un fichier .env avec vos clés VITE_FIREBASE_*.");
      }
    };

    return {
      ready,
      user,
      profile,
      configured: isFirebaseConfigured,
      async signInWithEmail(email, password) {
        guard();
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      async signUpWithEmail(email, password, extras) {
        guard();
        pendingDefaults.current = extras;
        const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
        if (extras.name) await updateProfile(cred.user, { displayName: extras.name });
        await ensureProfile(cred.user, {
          displayName: extras.name ?? null,
          role: extras.role,
          phone: extras.phone ?? null,
          city: extras.city ?? null,
        });
      },
      async signInWithGoogle(defaults) {
        guard();
        if (defaults) pendingDefaults.current = defaults;
        const provider = new GoogleAuthProvider();
        await signInWithPopup(getFirebaseAuth(), provider);
      },
      async startPhoneSignIn(phoneE164, recaptchaContainerId) {
        guard();
        const auth = getFirebaseAuth();
        if (!recaptchaRef.current) {
          recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, { size: "invisible" });
        }
        return signInWithPhoneNumber(auth, phoneE164, recaptchaRef.current);
      },
      async confirmPhoneCode(confirmation, code, defaults) {
        guard();
        if (defaults) pendingDefaults.current = defaults;
        await confirmation.confirm(code);
      },
      async updateUserProfile(patch) {
        guard();
        if (!user) throw new Error("Non connecté.");
        const ref = doc(getDb(), "profiles", user.uid);
        await setDoc(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true });
        if (patch.displayName || patch.avatar) {
          await updateProfile(user, {
            displayName: patch.displayName ?? user.displayName ?? undefined,
            photoURL: patch.avatar ?? user.photoURL ?? undefined,
          });
        }
        const merged: AuthProfile = { ...(profile ?? emptyProfile(user)), ...patch, uid: user.uid };
        setProfile(merged);
        try {
          await syncPublicListing(merged);
        } catch (e) {
          console.warn("syncPublicListing failed (non-fatal)", e);
        }
      },
      async logout() {
        guard();
        await signOut(getFirebaseAuth());
      },
    };
  }, [ready, user, profile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
