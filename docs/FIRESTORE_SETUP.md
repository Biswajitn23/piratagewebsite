# Firestore Setup Instructions

## Step 1: Run the Setup Script

This script creates all 5 collections in your Firestore database with sample data.

```bash
node server/scripts/setup_firestore.mjs
```

## Step 2: Create Composite Indexes

After running the script, you need to create these indexes in Firebase Console:

### 1. Go to Firebase Console
https://console.firebase.google.com/project/piratage-d89e7/firestore

### 2. Create Indexes

#### For `email_notifications` collection:
- Field 1: `status` (Ascending)
- Field 2: `created_at` (Ascending)

#### For `subscribers` collection:
- Index 1: Single field index on `email` (Ascending)
- Index 2: Single field index on `is_active` (Ascending)

#### For `events` collection:
- Index 1: Single field index on `date` (Ascending)
- Index 2: Single field index on `status` (Ascending)

#### For `help_requests` collection:
- Single field index on `created_at` (Descending)

#### For `gallery` collection:
- Single field index on `created_at` (Ascending)

### 3. Wait for Indexes to Build

After creating the indexes, wait a few minutes for them to build. You'll see "Building" status change to "Enabled".

## Step 3: Clean Up Sample Data (Optional)

Once indexes are ready, you can delete the sample documents:

1. Go to Firestore Database in Firebase Console
2. Navigate to each collection
3. Delete the sample documents (those with "Sample" in the title)

## Collections Created

✅ **help_requests** - Help form submissions  
✅ **gallery** - Gallery media items  
✅ **subscribers** - Email subscription list  
✅ **email_notifications** - Notification queue  
✅ **events** - Event listings

## Verify Setup

Run your application locally to verify everything works:

```bash
npm run dev
```

Then test:
- Visit http://localhost:3000
- Check if events load
- Try subscribing to emails
- Submit a help request

All done! Your Firestore database is ready! 🎉
