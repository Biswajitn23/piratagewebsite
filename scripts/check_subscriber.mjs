import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load backend env specifically
dotenv.config({ path: './backend/.env' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  console.error('Missing FIREBASE envs in backend/.env');
  process.exit(2);
}

const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

async function check(email) {
  const docId = email.toLowerCase();
  try {
    const snap = await db.collection('subscribers').doc(docId).get();
    if (snap.exists) {
      console.log('FOUND subscriber by docId:', docId);
      console.log(JSON.stringify(snap.data(), null, 2));
      return;
    }

    // If not found by doc id, try query by email field
    const q = await db.collection('subscribers').where('email', '==', email.toLowerCase()).limit(5).get();
    if (!q.empty) {
      console.log('FOUND subscriber by query (email field):');
      q.docs.forEach(d => console.log(d.id, JSON.stringify(d.data(), null, 2)));
      return;
    }

    console.log('NOT FOUND in Firestore (by docId or email field):', docId);
  } catch (err) {
    console.error('Error querying Firestore:', err);
  }
}

const email = process.argv[2] || 'test+ci@piratageauc.tech';
check(email).then(() => process.exit(0));
