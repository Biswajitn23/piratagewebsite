// Shared Firebase Admin initialization for Node.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

let initialized = false;

function normalizePrivateKey(key?: string) {
  return key?.replace(/\\n/g, "\n");
}

export function initFirebaseIfPossible() {
  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }
  if (initialized) return;
  try {
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
    try {
      const serviceAccountPath = resolve(process.cwd(), "piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json");
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      return;
    } catch {}
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        admin.initializeApp();
        initialized = true;
        return;
      } catch {}
    }
  } catch (err) {
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
