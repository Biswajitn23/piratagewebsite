/**
 * Firebase Firestore Setup Script
 * 
 * This script creates the 5 collections needed for the application:
 * 1. help_requests
 * 2. gallery
 * 3. subscribers
 * 4. email_notifications
 * 5. events
 * 
 * Run this script once to initialize your Firestore database
 * Usage: node server/scripts/setup_firestore.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

// Load Firebase credentials
const serviceAccount = JSON.parse(
  readFileSync('./piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json', 'utf8')
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function setupCollections() {
  console.log('🚀 Setting up Firestore collections...\n');

  try {
    // 1. Create help_requests collection with sample document
    console.log('📝 Creating help_requests collection...');
    const helpRequestId = randomUUID();
    await db.collection('help_requests').doc(helpRequestId).set({
      id: helpRequestId,
      name: 'Sample User',
      email: 'sample@example.com',
      message: 'This is a sample help request',
      topic: 'General help',
      created_at: Timestamp.now()
    });
    console.log('✅ help_requests collection created\n');

    // 2. Create gallery collection with sample document
    console.log('🖼️  Creating gallery collection...');
    const galleryId = randomUUID();
    await db.collection('gallery').doc(galleryId).set({
      id: galleryId,
      title: 'Sample Gallery Item',
      category: 'workshop',
      media: 'https://example.com/image.jpg',
      orientation: 'landscape',
      description: 'Sample gallery item',
      created_at: Timestamp.now()
    });
    console.log('✅ gallery collection created\n');

    // 3. Create subscribers collection with sample document
    console.log('📧 Creating subscribers collection...');
    const subscriberId = randomUUID();
    await db.collection('subscribers').doc(subscriberId).set({
      id: subscriberId,
      email: 'subscriber@example.com',
      subscribed_at: Timestamp.now(),
      is_active: true,
      unsubscribe_token: randomUUID()
    });
    console.log('✅ subscribers collection created\n');

    // 4. Create email_notifications collection with sample document
    console.log('📬 Creating email_notifications collection...');
    const notificationId = randomUUID();
    await db.collection('email_notifications').doc(notificationId).set({
      id: notificationId,
      event_id: 'sample-event-id',
      event_title: 'Sample Event',
      sent_to_count: 0,
      status: 'pending',
      created_at: Timestamp.now()
    });
    console.log('✅ email_notifications collection created\n');

    // 5. Create events collection with sample document
    console.log('🎉 Creating events collection...');
    const eventId = randomUUID();
    await db.collection('events').doc(eventId).set({
      id: eventId,
      title: 'Sample Workshop',
      date: new Date('2025-12-31T18:00:00Z').toISOString(),
      type: 'workshop',
      status: 'upcoming',
      coverImage: 'https://example.com/cover.jpg',
      gallery: [],
      description: 'This is a sample workshop event',
      speakers: [],
      registrationLink: 'https://example.com/register',
      slug: 'sample-workshop'
    });
    console.log('✅ events collection created\n');

    // Create composite indexes (these need to be created in Firebase Console)
    console.log('\n⚠️  IMPORTANT: Create these indexes in Firebase Console:\n');
    console.log('1. email_notifications:');
    console.log('   - status (Ascending) + created_at (Ascending)\n');
    console.log('2. subscribers:');
    console.log('   - email (Ascending)');
    console.log('   - is_active (Ascending)\n');
    console.log('3. events:');
    console.log('   - date (Ascending)');
    console.log('   - status (Ascending)\n');

    console.log('🎉 Setup complete! All 5 collections have been created.');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Firebase Console > Firestore Database');
    console.log('2. Create the composite indexes listed above');
    console.log('3. Delete the sample documents if needed');
    console.log('4. Deploy your application\n');

  } catch (error) {
    console.error('❌ Error setting up collections:', error);
    throw error;
  }
}

// Run the setup
setupCollections()
  .then(() => {
    console.log('✅ Firestore setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
