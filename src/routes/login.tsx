import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type UserRole } from "@/integrations/firebase/auth-context";
import { firebaseErrorToMessage } from "@/integrations/firebase/errors";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — Travail Connect" }] }),
});

type Mode = "signin" | "signup" | "phone";

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("client");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<Awaited<ReturnType<typeof auth.startPhoneSignIn>> | null>(null);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/" });
  };

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signInWithEmail(email.trim(), password);
      toast.success("Connexion réussie");
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPwd) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      // For client: minimal info (we'll use email prefix as default name).
      // For worker/company: collect name now, the rest is filled on /profile/complete.
      const finalName = role === "client" ? (name.trim() || email.split("@")[0]) : name.trim();
      await auth.signUpWithEmail(email.trim(), password, { name: finalName, role });
      toast.success("Compte créé. Bienvenue !");
      // Client = ready to use immediately. Pros must complete required fields.
      navigate({ to: role === "client" ? "/" : "/profile/complete" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await auth.signInWithGoogle({ role });
      toast.success("Connexion réussie");
      // Always send to completion page so role-specific required fields are filled.
      // Already-complete users can hit Save and bounce immediately.
      navigate({ to: role === "client" ? "/" : "/profile/complete" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const normalized = phone.replace(/\s/g, "");
      const e164 = normalized.startsWith("+") ? normalized : `+216${normalized.replace(/^0/, "")}`;
      const conf = await auth.startPhoneSignIn(e164, "recaptcha-container");
      setConfirmation(conf);
      toast.success("Code SMS envoyé");
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmation) return;
    setLoading(true);
    try {
      await auth.confirmPhoneCode(confirmation, code.trim(), { role, phone });
      toast.success("Connexion réussie");
      navigate({ to: role === "client" ? "/" : "/profile/complete" });
    } catch (err) {
      toast.error(firebaseErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={goBack} className="p-1 -ml-1" aria-label="Retour">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold flex-1">
            {mode === "signin" ? "Connexion" : mode === "signup" ? "Créer un compte" : "Connexion par téléphone"}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6">
        {!auth.configured && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
            Firebase n'est pas configuré. Ajoutez vos clés <code>VITE_FIREBASE_*</code> dans <code>.env</code>.
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-xl mb-5">
          {(["signin", "signup", "phone"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === m ? "bg-card tc-shadow-card" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Connexion" : m === "signup" ? "Inscription" : "📱 SMS"}
            </button>
          ))}
        </div>

        {/* Role picker — for signup, phone, AND google (so we know how to complete). */}
        {mode !== "signin" && (
          <div className="mb-4">
            <label className="text-xs font-semibold mb-1.5 block">{t("auth.chooseRole")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["client", "worker", "company"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-xl border-2 text-start transition-all ${
                    role === r ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {r === "client" ? t("auth.roleClient") : r === "worker" ? t("auth.roleWorker") : t("auth.roleCompany")}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {r === "client" ? t("auth.roleClientHint") : r === "worker" ? t("auth.roleWorkerHint") : t("auth.roleCompanyHint")}
                  </div>
                </button>
              ))}
            </div>
            {role === "client" ? (
              <p className="text-[10px] text-muted-foreground mt-2">⚡ Inscription rapide : email, mot de passe, confirmation.</p>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-2">📋 Vous compléterez vos infos pro juste après l'inscription.</p>
            )}
          </div>
        )}

        {mode === "signin" && (
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <Field icon={<Mail size={16} />} type="email" placeholder="email@example.com" value={email} onChange={setEmail} />
            <Field icon={<Lock size={16} />} type="password" placeholder="Mot de passe" value={password} onChange={setPassword} />
            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95">
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Se connecter"}
            </Button>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            {role !== "client" && (
              <Field icon={<User size={16} />} placeholder={role === "company" ? "Votre nom (contact)" : "Nom complet"} value={name} onChange={setName} />
            )}
            <Field icon={<Mail size={16} />} type="email" placeholder="email@example.com" value={email} onChange={setEmail} />
            <Field icon={<Lock size={16} />} type="password" placeholder="Mot de passe (min 6)" value={password} onChange={setPassword} />
            <Field icon={<Lock size={16} />} type="password" placeholder="Confirmer le mot de passe" value={confirmPwd} onChange={setConfirmPwd} />
            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95">
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Créer le compte"}
            </Button>
          </form>
        )}

        {mode === "phone" && (
          <div className="space-y-3">
            {!confirmation ? (
              <form onSubmit={handleSendCode} className="space-y-3">
                <Field icon={<Phone size={16} />} type="tel" placeholder="+216 55 123 456" value={phone} onChange={setPhone} />
                <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Recevoir un code SMS"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmCode} className="space-y-3">
                <Field placeholder="Code SMS à 6 chiffres" value={code} onChange={setCode} />
                <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Vérifier le code"}
                </Button>
                <button type="button" onClick={() => setConfirmation(null)} className="w-full text-xs text-muted-foreground">
                  Renvoyer un code
                </button>
              </form>
            )}
            <div id="recaptcha-container" />
          </div>
        )}

        {mode !== "phone" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" /> ou <span className="flex-1 h-px bg-border" />
            </div>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-card border border-border text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <GoogleIcon /> Continuer avec Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos{" "}
          <Link to="/privacy" className="text-primary underline">conditions</Link>.
        </p>
      </div>
    </div>
  );
}

function Field(props: {
  icon?: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      {props.icon && (
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">{props.icon}</span>
      )}
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className={`w-full h-11 ${props.icon ? "ps-10" : "ps-3"} pe-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30`}
        required
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.7 0 19.2-7.7 19.2-19.5 0-1.2-.1-2.3-.6-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.4-4.3 2.2-6.9 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.3 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.5 5.6l6 5c-.4.4 6.7-4.9 6.7-14.6 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
