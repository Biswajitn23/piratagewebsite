// Touch: force Vercel to include this file in deployment
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

let initialized = false;

function normalizePrivateKey(key?: string) {
  return key?.replace(/\\n/g, "\n");
}

export function initFirebaseIfPossible() {
  if (initialized) return;
  try {
    // Option 1: Try to load service account from file in project root
    try {
      const serviceAccountPath = resolve(process.cwd(), "piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json");
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[Firebase] Initialized with service account file");
      initialized = true;
      return;
    } catch (fileErr) {
      // File not found or invalid, try other methods
    }

    // Option 2: GOOGLE_APPLICATION_CREDENTIALS (ADC) provided; let admin auto-initialize.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("[Firebase] Trying GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
      admin.initializeApp();
      console.log("[Firebase] Initialized with GOOGLE_APPLICATION_CREDENTIALS");
      initialized = true;
      return;
    }

    // Option 3: Explicit FIREBASE_* env credentials
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    console.log("[Firebase] Checking explicit env: projectId=", !!projectId, "clientEmail=", !!clientEmail, "privateKey=", !!privateKey);

    if (projectId && clientEmail && privateKey) {
      console.log("[Firebase] Initializing with explicit env credentials");
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      console.log("[Firebase] Initialized with explicit env credentials");
      initialized = true;
      return;
    }
    
    console.warn("[Firebase] No valid credentials found");
  } catch (err) {
    console.error("[Firebase] Initialization failed:", err);
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
