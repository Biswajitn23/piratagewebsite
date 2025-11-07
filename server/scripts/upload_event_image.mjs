import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY not set in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const [,, imagePath, eventId, bucket = 'events'] = process.argv;
  if (!imagePath || !eventId) {
    console.error('Usage: node upload_event_image.mjs <image-path> <event-id> [bucket]');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error('Image file does not exist:', imagePath);
    process.exit(2);
  }

  const ext = path.extname(imagePath) || '.jpg';
  const destPath = `events/${eventId}/${Date.now()}${ext}`;

  try {
    const stream = fs.createReadStream(imagePath);
    console.log('Uploading', imagePath, 'to bucket', bucket, 'as', destPath);
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(destPath, stream, {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeFromExt(ext),
    });
    if (uploadError) {
      console.error('Upload error:', uploadError.message || uploadError);
      process.exit(3);
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(destPath);
    const publicUrl = publicData && publicData.publicUrl ? publicData.publicUrl : null;
    console.log('Public URL:', publicUrl);

    // Upsert event record with coverImage set to publicUrl
    const upsertPayload = { id: eventId, coverImage: publicUrl };
    console.log('Upserting event row with coverImage...');
    const { data: dbData, error: dbError } = await supabase.from('events').upsert([upsertPayload]);
    if (dbError) {
      console.error('DB upsert error:', dbError.message || dbError);
      process.exit(4);
    }
    console.log('Upsert result:', dbData);
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(99);
  }
}

function mimeFromExt(ext) {
  const e = ext.toLowerCase();
  if (e === '.png') return 'image/png';
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg';
  if (e === '.webp') return 'image/webp';
  if (e === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

main();
