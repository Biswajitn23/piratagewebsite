/**
 * Test script to verify email subscription sends confirmation email
 * 
 * Usage: node test_subscription.mjs your-email@example.com
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:8080';

async function testSubscription(email) {
  try {
    console.log(`\n🧪 Testing subscription for: ${email}\n`);
    
    const response = await fetch(`${BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.ok) {
      console.log(`\n✅ SUCCESS! Subscription completed.`);
      console.log(`📧 Check ${email} for confirmation email.`);
      console.log(`\nThe email should contain:`);
      console.log(`   - Subject: "Successfully subscribed to Piratage Event Notifications"`);
      console.log(`   - Confirmation that you'll receive notifications for new events`);
      console.log(`   - A link to visit the website`);
    } else {
      console.log(`\n❌ FAILED: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`\n❌ ERROR:`, error.message);
    console.log(`\n💡 Make sure:`);
    console.log(`   1. Server is running (pnpm dev)`);
    console.log(`   2. RESEND_API_KEY is set in .env`);
    console.log(`   3. Supabase is configured`);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node test_subscription.mjs your-email@example.com');
  process.exit(1);
}

testSubscription(email);
