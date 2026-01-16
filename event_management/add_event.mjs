/**
 * Add events to Firestore (Events Section)
 * Usage: node event_management/add_event.mjs
 * Note: This only adds event details. Use update_event_photos.mjs to add photos.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { notifySubscribersOfEvent } from './notify_event_subscribers.mjs';

// Load Firebase credentials
const serviceAccount = JSON.parse(
  readFileSync('./piratage-d89e7-firebase-adminsdk-fbsvc-d172134019.json', 'utf8')
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function addDemoEvent() {
  console.log('🎉 Adding demo events to Firestore...\n');

  try {
    // 1. Add an ONGOING event
    const ongoingEventId = randomUUID();
    const now = new Date();
    const ongoingEventData = {
      id: ongoingEventId,
      title: 'Capture The Flag Challenge 2025',
      date: now.toISOString(),
      type: 'competition',
      status: 'ongoing',
      description: 'Join our month-long CTF challenge! Test your hacking skills across multiple categories: web exploitation, cryptography, reverse engineering, and more. New challenges released weekly!',
      location: 'Online',
      venue: 'Virtual Platform',
      registrationLink: 'https://ctf.piratage.club',
      coverImage: '',
      gallery: [],
      speakers: [],
      tags: ['ctf', 'competition', 'ongoing'],
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    await db.collection('events').doc(ongoingEventId).set(ongoingEventData);
    console.log('✅ Ongoing event added!');
    console.log(`   Title: ${ongoingEventData.title}`);
    console.log(`   Status: ${ongoingEventData.status}\n`);
    await notifySubscribersOfEvent(ongoingEventData);

    // 2. Add an UPCOMING event
    const upcomingEventId = randomUUID();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(18, 0, 0, 0); // 6 PM
    const upcomingEventData = {
      id: upcomingEventId,
      title: 'Demo Ethical Hacking Workshop',
      date: nextWeek.toISOString(),
      type: 'workshop',
      status: 'upcoming',
      description: 'Join us for an interactive session on ethical hacking fundamentals, web security, and penetration testing techniques. Perfect for beginners and intermediate learners!',
      location: 'ASET Lab, Amity University Chhattisgarh',
      venue: 'Lab 301',
      registrationLink: 'https://forms.gle/example',
      coverImage: '',
      gallery: [],
      speakers: [
        {
          name: 'Mr. Pawan Kumar',
          role: 'Cybersecurity Expert',
          image: 'https://randomuser.me/api/portraits/men/32.jpg',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
          name: 'Nitin Singh',
          role: 'Ethical Hacking Specialist',
          image: 'https://randomuser.me/api/portraits/men/45.jpg',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
        }
      ],
      tags: ['ethical-hacking', 'workshop', 'security'],
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    await db.collection('events').doc(upcomingEventId).set(upcomingEventData);
    console.log('✅ Upcoming event added!');
    console.log(`   Title: ${upcomingEventData.title}`);
    console.log(`   Date: ${nextWeek.toLocaleDateString()} at ${nextWeek.toLocaleTimeString()}`);
    console.log(`   Status: ${upcomingEventData.status}\n`);
    await notifySubscribersOfEvent(upcomingEventData);

    // 3. Add a PAST event
    const pastEventId = randomUUID();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(14, 0, 0, 0); // 2 PM
    const pastEventData = {
      id: pastEventId,
      title: 'Web Security Fundamentals Session',
      date: lastMonth.toISOString(),
      type: 'workshop',
      status: 'past',
      description: 'A comprehensive workshop covering OWASP Top 10 vulnerabilities, SQL injection, XSS attacks, and secure coding practices. Over 50 students participated!',
      location: 'Main Auditorium, Amity University',
      venue: 'Auditorium A',
      registrationLink: '',
      coverImage: '',
      gallery: [],
      speakers: [
        {
          name: 'Dr. Rajesh Kumar',
          role: 'Web Security Professor',
          image: 'https://randomuser.me/api/portraits/men/67.jpg',
          avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
        },
        {
          name: 'Ms. Priya Sharma',
          role: 'Security Researcher',
          image: 'https://randomuser.me/api/portraits/women/44.jpg',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        }
      ],
      tags: ['web-security', 'workshop', 'past'],
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    await db.collection('events').doc(pastEventId).set(pastEventData);
    console.log('✅ Past event added!');
    console.log(`   Title: ${pastEventData.title}`);
    console.log(`   Date: ${lastMonth.toLocaleDateString()}`);
    console.log(`   Status: ${pastEventData.status}\n`);
    await notifySubscribersOfEvent(pastEventData);
    
    console.log('🎯 All demo events added successfully!\n');
    console.log('📝 Next steps:');
    console.log('  1. View events: http://localhost:3000 → Events radar section');
    console.log('  2. Add photos: node event_management/update_event_photos.mjs\n');
    console.log('💡 Tip: Run update_event_photos.mjs to see event IDs and add cover/gallery images.\n');

  } catch (error) {
    console.error('❌ Error adding demo events:', error);
    process.exit(1);
  }

  process.exit(0);
}

addDemoEvent();
