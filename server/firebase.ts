import * as admin from "firebase-admin";

let initialized = false;

function normalizePrivateKey(key?: string) {
  return key?.replace(/\\n/g, "\n");
}

export function initFirebaseIfPossible() {
  if (initialized) return;
  try {
    // Option 1: GOOGLE_APPLICATION_CREDENTIALS (ADC) provided; let admin auto-initialize.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
      initialized = true;
      return;
    }

    // Option 2: Explicit FIREBASE_* env credentials
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      initialized = true;
      return;
    }
  } catch (err) {
    // Swallow error; will report disabled state
    initialized = false;
  }
}

export function isFirestoreEnabled() {
  initFirebaseIfPossible();
  try {
    return Boolean(admin.apps?.length);
  } catch {
    return false;
  }
}

export function getFirestore() {
  initFirebaseIfPossible();
  if (!isFirestoreEnabled()) {
    throw new Error("Firestore not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_* envs.");
  }
  return admin.firestore();
}
