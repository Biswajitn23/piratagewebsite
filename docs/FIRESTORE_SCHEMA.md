# Firestore Collections Schema

This document describes the Firestore collections that replace the previous Supabase tables.

## Collections

### 1. `help_requests`
Stores help/doubt submissions from the "Need Help" form.

**Document ID**: Auto-generated UUID
**Fields**:
- `id` (string): Same as document ID
- `name` (string): Requester's name
- `email` (string): Requester's email
- `message` (string): Help request message
- `topic` (string): Topic/category
- `created_at` (timestamp): Submission timestamp

**Indexes**: 
- `created_at` (descending)

---

### 2. `gallery`
Stores gallery items for the site gallery section.

**Document ID**: Auto-generated UUID
**Fields**:
- `id` (string): Same as document ID
- `title` (string): Gallery item title
- `category` (string, optional): Category/tag
- `media` (string): Media URL or storage path
- `orientation` (string, optional): 'landscape' or 'portrait'
- `description` (string, optional): Item description
- `created_at` (timestamp): Upload timestamp

**Indexes**: 
- `created_at` (ascending)
- `category` (ascending)

---

### 3. `subscribers`
Stores email subscribers for event notifications.

**Document ID**: Auto-generated UUID
**Fields**:
- `id` (string): Same as document ID
- `email` (string): Subscriber email (lowercase)
- `subscribed_at` (timestamp): Subscription timestamp
- `is_active` (boolean): Whether subscription is active
- `unsubscribe_token` (string): Unique token for unsubscribe link

**Indexes**: 
- `email` (ascending) - for duplicate checking
- `is_active` (ascending) - for filtering active subscribers

**Security Rules**:
```javascript
// Allow anyone to read/write (subscription is public)
match /subscribers/{subscriberId} {
  allow read, write: if true;
}
```

---

### 4. `email_notifications`
Tracks email notification jobs for new events.

**Document ID**: Auto-generated UUID
**Fields**:
- `id` (string): Same as document ID
- `event_id` (string): Reference to event ID
- `event_title` (string): Event title (denormalized)
- `sent_to_count` (number): Number of emails sent
- `status` (string): 'pending' | 'processing' | 'sent' | 'failed'
- `created_at` (timestamp): Notification creation time
- `sent_at` (timestamp, optional): When notification was sent
- `error_message` (string, optional): Error details if failed

**Indexes**: 
- `status` (ascending)
- `created_at` (descending)

---

### 5. `events`
Stores event information (workshops, hackathons, etc.).

**Document ID**: Auto-generated UUID or custom slug
**Fields**:
- `id` (string): Same as document ID
- `title` (string): Event title
- `date` (string or timestamp): Event date
- `type` (string): Event type (workshop, hackathon, etc.)
- `status` (string): 'upcoming' | 'ongoing' | 'past'
- `coverImage` (string): Cover image URL
- `gallery` (array): Array of gallery image URLs
- `description` (string): Event description
- `speakers` (array): Array of speaker objects
- `registrationLink` (string, optional): Registration URL
- `slug` (string, optional): URL slug
- `highlightScene` (string, optional): Highlight/featured flag

**Indexes**: 
- `date` (ascending)
- `status` (ascending)

---

## Migration Notes

- All Supabase SQL tables have been converted to Firestore collections
- Timestamps use Firestore `Timestamp` type instead of PostgreSQL `timestamptz`
- UUIDs are still used for document IDs for consistency
- Row Level Security (RLS) replaced with Firestore Security Rules
- SQL triggers removed; notification creation handled in application code
