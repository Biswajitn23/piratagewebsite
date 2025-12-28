/**
 * Add gallery items to the Gallery section on the website
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

// ============================================
// 🎨 CUSTOMIZE YOUR GALLERY ITEMS HERE
// ============================================
// These images will appear in the Gallery section on your website
// You can customize: title, category, media URL, orientation, and description

const GALLERY_ITEMS = [
  {
    title: 'CTF Competition 2024',
    category: 'COMPETITION',
    media: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    orientation: 'landscape',
    description: 'Students competing in our annual Capture The Flag challenge, solving complex security puzzles.'
  },
  {
    title: 'Network Security Lab',
    category: 'LAB SESSION',
    media: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    orientation: 'landscape',
    description: 'Hands-on network security training in our state-of-the-art cyber lab.'
  },
  {
    title: 'Web Security Workshop',
    category: 'WORKSHOP',
    media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    orientation: 'landscape',
    description: 'Interactive workshop covering OWASP Top 10 vulnerabilities and secure coding practices.'
  },
  {
    title: 'Penetration Testing Demo',
    category: 'FIELD OPS',
    media: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800',
    orientation: 'landscape',
    description: 'Live demonstration of penetration testing techniques and ethical hacking methodologies.'
  },
  {
    title: 'Team Collaboration',
    category: 'TEAM',
    media: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    orientation: 'landscape',
    description: 'Our club members working together on cybersecurity projects and research.'
  },
  {
    title: 'Cryptography Session',
    category: 'LAB SESSION',
    media: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    orientation: 'landscape',
    description: 'Advanced cryptography techniques and encryption algorithms training session.'
  }
];

// ============================================

// Load Firebase credentials
const serviceAccount = JSON.parse(
  readFileSync('./piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json', 'utf8')
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function addGalleryItems() {
  console.log('🖼️  Adding gallery items to Firestore...\n');

  try {
    const now = new Date();
    let addedCount = 0;

    for (const item of GALLERY_ITEMS) {
      const itemId = randomUUID();
      const galleryData = {
        id: itemId,
        title: item.title,
        category: item.category,
        media: item.media,
        orientation: item.orientation,
        description: item.description,
        created_at: now.toISOString()
      };

      await db.collection('gallery').doc(itemId).set(galleryData);
      addedCount++;
      
      console.log(`✅ Added: ${item.title}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   ID: ${itemId}\n`);
    }

    console.log(`🎯 Successfully added ${addedCount} gallery items!\n`);
    console.log('View them on your website:');
    console.log('  1. Open http://localhost:3000');
    console.log('  2. Scroll to the "Gallery" section');
    console.log('  3. Horizontal scroll to see all images\n');

  } catch (error) {
    console.error('❌ Error adding gallery items:', error);
    process.exit(1);
  }

  process.exit(0);
}

addGalleryItems();
