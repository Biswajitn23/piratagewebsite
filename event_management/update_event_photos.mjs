/**
 * Update photos for a specific event in Firestore
 * Usage: node update_event_photos.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load Firebase credentials
const serviceAccount = JSON.parse(
  readFileSync('./piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json', 'utf8')
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ============================================
// 📸 STEP 1: First, run this script to see all events
// ============================================

async function listAllEvents() {
  console.log('📋 Fetching all events from Firestore...\n');
  
  try {
    const snapshot = await db.collection('events').get();
    
    if (snapshot.empty) {
      console.log('⚠️  No events found in Firestore.\n');
      return [];
    }

    const events = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        docId: doc.id,
        id: data.id,
        title: data.title,
        status: data.status,
        date: data.date,
        galleryCount: (data.gallery || []).length,
        hasCoverImage: !!data.coverImage
      });
    });

    console.log('Found', events.length, 'event(s):\n');
    console.log('═'.repeat(80));
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Document ID: ${event.docId}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Gallery Photos: ${event.galleryCount}`);
      console.log(`   Cover Image: ${event.hasCoverImage ? '✅ Yes' : '❌ No'}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    return events;

  } catch (error) {
    console.error('❌ Error fetching events:', error);
    process.exit(1);
  }
}

// ============================================
// 📸 STEP 2: Add photos to a specific event
// ============================================

async function updateEventPhotos(eventDocId, coverImage, galleryPhotos) {
  console.log(`\n🖼️  Updating photos for event: ${eventDocId}...\n`);
  
  try {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    if (galleryPhotos && galleryPhotos.length > 0) {
      updateData.gallery = galleryPhotos;
    }

    await db.collection('events').doc(eventDocId).update(updateData);
    
    console.log('✅ Photos updated successfully!');
    if (coverImage) {
      console.log(`   Cover Image: ${coverImage}`);
    }
    if (galleryPhotos && galleryPhotos.length > 0) {
      console.log(`   Gallery Photos: ${galleryPhotos.length} images added`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error updating photos:', error);
    process.exit(1);
  }
}

// ============================================
// 🎨 STEP 3: Configure photos for specific events
// ============================================

const PHOTO_CONFIG = {
  // Copy the Document ID from the list above and paste it here
  // Example: 'afbcd4ef-bc8f-4901-b8ec-24d5c71f1471'
  
  eventDocumentId: 'be4f54cc-5d3f-4a3e-b049-b721520e0be6',
  // Add cover image URL (replace with your actual event image if needed)
  coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
  // Add gallery photos URLs (optional, can keep as is or update)
  gallery: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800'
  ]
};

// ============================================
// Main execution
// ============================================

async function main() {
  // First, list all events so you can see their IDs
  const events = await listAllEvents();
  
  // If you've configured PHOTO_CONFIG, update the event
  if (PHOTO_CONFIG.eventDocumentId !== 'PUT_EVENT_DOCUMENT_ID_HERE') {
    console.log('\n📝 Found photo configuration, updating event...\n');
    await updateEventPhotos(
      PHOTO_CONFIG.eventDocumentId,
      PHOTO_CONFIG.coverImage,
      PHOTO_CONFIG.gallery
    );
  } else {
    console.log('\n💡 HOW TO ADD PHOTOS TO A SPECIFIC EVENT:');
    console.log('   1. Copy the "Document ID" from the list above');
    console.log('   2. Edit this file (update_event_photos.mjs)');
    console.log('   3. Find the PHOTO_CONFIG section (line ~90)');
    console.log('   4. Replace "PUT_EVENT_DOCUMENT_ID_HERE" with the Document ID');
    console.log('   5. Add your image URLs to coverImage and gallery array');
    console.log('   6. Run: node update_event_photos.mjs\n');
  }

  process.exit(0);
}

main();
