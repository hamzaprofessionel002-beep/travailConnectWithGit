/**
 * Translates raw Firebase error codes into user-friendly French/Arabic
 * messages. Falls back to the original message if the code is unknown.
 */
import type { FirebaseError } from "firebase/app";

const FR: Record<string, string> = {
  "auth/invalid-email": "Adresse email invalide.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/user-not-found": "Aucun compte trouvé avec cet email.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/email-already-in-use": "Cet email est déjà utilisé.",
  "auth/weak-password": "Mot de passe trop faible (min. 6 caractères).",
  "auth/operation-not-allowed": "Méthode de connexion non activée. Contactez le support.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
  "auth/popup-closed-by-user": "Connexion annulée.",
  "auth/popup-blocked": "Popup bloquée par le navigateur.",
  "auth/cancelled-popup-request": "Connexion annulée.",
  "auth/account-exists-with-different-credential":
    "Un compte existe déjà avec une autre méthode de connexion.",
  "auth/invalid-verification-code": "Code de vérification incorrect.",
  "auth/invalid-verification-id": "Session de vérification expirée. Renvoyez le code.",
  "auth/missing-verification-code": "Veuillez saisir le code reçu par SMS.",
  "auth/invalid-phone-number": "Numéro de téléphone invalide.",
  "auth/missing-phone-number": "Veuillez saisir un numéro de téléphone.",
  "auth/quota-exceeded": "Limite quotidienne de SMS atteinte. Réessayez demain.",
  "auth/captcha-check-failed": "Vérification reCAPTCHA échouée. Réessayez.",
  "auth/app-not-authorized": "Domaine non autorisé. Ajoutez-le dans Firebase Console.",
  "auth/unauthorized-domain":
    "Domaine non autorisé. Ajoutez-le dans Firebase → Authentication → Authorized domains.",
  "permission-denied": "Action non autorisée. Vérifiez les règles Firestore.",
  unavailable: "Service temporairement indisponible. Réessayez.",
  unauthenticated: "Vous devez être connecté pour effectuer cette action.",
};

export function firebaseErrorToMessage(err: unknown): string {
  if (!err) return "Erreur inconnue.";
  const fe = err as FirebaseError;
  const code = fe?.code;
  if (code && FR[code]) return FR[code];
  if (code) return `${FR[code] ?? "Erreur"} (${code})`;
  if (err instanceof Error) return err.message;
  return String(err);
}
