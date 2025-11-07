import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY not set in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    console.log('Fetching events from Supabase...');
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true }).limit(100);
    if (error) {
      console.error('Supabase error:', error.message || error);
      process.exit(2);
    }
    console.log('Events found:', (data || []).length);
    (data || []).forEach((e) => {
      console.log('---');
      console.log('id     :', e.id);
      console.log('title  :', e.title);
      console.log('cover  :', e.coverImage);
      console.log('raw    :', JSON.stringify(e));
    });
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(99);
  }
})();
