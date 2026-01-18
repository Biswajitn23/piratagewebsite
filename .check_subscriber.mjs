import admin from 'firebase-admin';

async function main(){
  try{
    if (!admin.apps || !admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
      if (projectId && clientEmail && privateKeyRaw) {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
        console.log('Firebase initialized via FIREBASE_* envs');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp();
        console.log('Firebase initialized via GOOGLE_APPLICATION_CREDENTIALS');
      } else {
        console.log('No Firebase credentials found in env; cannot check Firestore');
        process.exit(0);
      }
    }
    const db = admin.firestore();
    const email = 'nbiswajit978@gmail.com'.toLowerCase();
    const doc = await db.collection('subscribers').doc(email).get();
    if (!doc.exists) {
      console.log('Subscriber doc not found for', email);
    } else {
      console.log('Subscriber found:', doc.data());
    }
  }catch(err){
    console.error('Error checking Firestore:', err?.message || err);
    process.exit(1);
  }
}

main();
