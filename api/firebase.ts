// Copied from server/firebase.ts for Vercel compatibility
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore as getFirestoreAdmin } from "firebase-admin/firestore";

let app: App | undefined;

function normalizePrivateKey(key?: string) {
  return key?.replace(/\\n/g, "\n");
}

export function initFirebaseIfPossible() {
  if (getApps().length > 0) {
    app = getApps()[0];
    return;
  }
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (projectId && clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      console.log("[Firebase] Initialized with environment variables");
    } else {
      console.warn("[Firebase] Missing credentials in Environment Variables");
    }
  } catch (err) {
    console.error("[Firebase] Initialization failed:", err);
  }
}

export function isFirestoreEnabled() {
  initFirebaseIfPossible();
  return getApps().length > 0;
}

export function getFirestore() {
  initFirebaseIfPossible();
  if (!isFirestoreEnabled()) {
    throw new Error("Firestore not configured. Check Vercel Environment Variables.");
  }
  return getFirestoreAdmin();
}
