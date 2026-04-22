# Travail Connect — Structure du projet

Application **TanStack Start** (React 19 + Vite 7 + Tailwind v4) avec
backend **Firebase** (Auth, Firestore) et **Cloudinary** (uploads images).

---

## ⚙️ Configuration requise

Créez un fichier `.env` à la racine du projet (au même niveau que `package.json`) :

```env
# Firebase (clés publiques — Web app)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...

# Cloudinary (unsigned upload preset)
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=votre_unsigned_preset
```

### Activation Firebase

1. https://console.firebase.google.com → créez un projet
2. **Authentication → Sign-in method** : activez **Email/Password**, **Google**, **Phone**
3. **Authentication → Settings → Authorized domains** : ajoutez `localhost`, `*.lovable.app`, et votre domaine de production
4. **Firestore Database** : créez la base en mode "production"
5. Récupérez la config Web : **Project settings → Your apps → Web app**

### Activation Cloudinary

1. https://cloudinary.com → créez un compte
2. **Settings → Upload → Upload presets → Add upload preset**
3. **Signing mode** = `Unsigned`
4. Notez le **Cloud name** (en haut du dashboard) et le **Preset name**

---

## 🗂️ Arborescence

```
travail-connect/
├── .env                       # Vos clés Firebase + Cloudinary (à créer, jamais commité)
├── package.json
├── vite.config.ts             # Config Vite + plugins TanStack
├── tsconfig.json
├── components.json            # Config shadcn/ui
├── wrangler.jsonc             # Config Cloudflare Workers (déploiement)
│
└── src/
    ├── router.tsx             # Bootstrap du router TanStack
    ├── routeTree.gen.ts       # ⚠️ Auto-généré, ne pas éditer
    ├── styles.css             # Tailwind v4 + tokens design (gradient bleu nuit → émeraude)
    │
    ├── routes/                # File-based routing (chaque fichier = une page)
    │   ├── __root.tsx         # Layout racine : html/head/body, AuthProvider, Toaster
    │   ├── index.tsx          # / — Accueil (CTA "publier demande", catégories, top pros)
    │   ├── browse.tsx         # /browse — Explorer (artisans + entreprises + filtre vérifié)
    │   ├── entreprises.tsx    # /entreprises — Annuaire des entreprises
    │   ├── favorites.tsx      # /favorites — Favoris locaux
    │   ├── login.tsx          # /login — Email / Google / SMS
    │   ├── profile.tsx        # /profile — Vue profil + menu paramètres
    │   ├── profile.edit.tsx   # /profile/edit — Édition (nom, tél, ville, rôle, avatar)
    │   ├── language.tsx       # /language — FR / AR
    │   ├── notifications.tsx  # /notifications
    │   ├── privacy.tsx        # /privacy
    │   ├── pro.tsx            # /pro — Espace pro (entreprise)
    │   ├── worker.$workerId.tsx     # Détail artisan
    │   └── company.$companyId.tsx   # Détail entreprise
    │
    ├── components/
    │   ├── AuthSync.tsx       # Synchronise Firebase Auth → Zustand store
    │   ├── BottomNav.tsx      # Barre de navigation mobile
    │   ├── CategoryFilter.tsx
    │   ├── CompanyCard.tsx
    │   ├── WorkerCard.tsx
    │   ├── ContactModal.tsx   # Appel / WhatsApp
    │   ├── QuoteModal.tsx     # Demande de devis (→ Firestore "quotes")
    │   ├── RequestModal.tsx   # Publier une demande (→ Firestore "requests")
    │   └── ui/                # shadcn/ui (button, dialog, sonner, …)
    │
    ├── integrations/
    │   ├── firebase/
    │   │   ├── client.ts          # initApp + auth/firestore/storage lazy getters
    │   │   ├── auth-context.tsx   # <AuthProvider> + useAuth() (email/google/phone)
    │   │   ├── services.ts        # createRequest, createQuote, listCollection
    │   │   └── errors.ts          # Traduction des codes d'erreur Firebase → FR
    │   └── cloudinary/
    │       └── upload.ts          # uploadImage() — unsigned preset, validation taille/type
    │
    ├── store/
    │   └── useAppStore.ts     # Zustand : favoris, langue, recherche, état auth synchronisé
    │
    ├── hooks/
    │   └── use-mobile.tsx
    │
    ├── i18n/
    │   ├── translations.ts    # FR + AR (toutes les chaînes UI)
    │   └── useT.ts            # Hook : t("namespace.key")
    │
    ├── lib/
    │   ├── utils.ts           # cn() pour Tailwind
    │   └── validation.ts      # Schémas Zod (auth, request, quote, profile, service)
    │
    ├── data/
    │   ├── workers.ts         # ~50 artisans fictifs (seed initial)
    │   └── companies.ts       # ~10 entreprises fictives (seed initial)
    │
    └── scripts/
        └── seed-firestore.ts  # Migration one-shot des données vers Firestore
```

---

## 🔄 Flux d'authentification

1. `__root.tsx` monte `<AuthProvider>` qui écoute `onAuthStateChanged`
2. `<AuthSync>` recopie l'utilisateur Firebase + son profil Firestore dans `useAppStore`
3. Tous les composants existants continuent de lire `store.isLoggedIn`, `store.userName`, etc. — sans modification
4. `/login` propose **3 méthodes** :
   - **Email + mot de passe** (création de compte ou connexion)
   - **Google** (popup OAuth)
   - **SMS** (avec reCAPTCHA invisible)
5. Au premier login, un document `profiles/{uid}` est créé automatiquement dans Firestore

## 📁 Collections Firestore

| Collection  | Champs principaux |
|-------------|-------------------|
| `profiles`  | `displayName`, `email`, `phone`, `city`, `role` (`client`/`worker`/`company`), `avatar` |
| `requests`  | `category`, `city`, `description`, `urgency`, `phone`, `userId`, `status`, `createdAt` |
| `quotes`    | `targetType`, `targetId`, `targetName`, `description`, `userId`, `userName`, `userPhone`, `status` |
| `workers`   | (rempli par le script de seed) |
| `companies` | (rempli par le script de seed) |

## 🌱 Migration des données

Une fois Firebase configuré, exécutez **une seule fois** dans la console du navigateur :

```js
import("/src/scripts/seed-firestore.ts").then(m => m.seedAll());
```

## 🎨 Design system

- **Gradient de marque** : bleu nuit `oklch(0.32 0.12 250)` → émeraude `oklch(0.55 0.18 165)`
- Classe utilitaire : `bg-gradient-brand`
- Police : Inter (400/500/600/700/800)
- Tokens dans `src/styles.css` : `--primary`, `--secondary`, `--accent`, `--gradient-brand`, etc.

## 🚀 Démarrer

```bash
bun install
bun run dev
```
