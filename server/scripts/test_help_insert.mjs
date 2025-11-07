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
    const id = `test-${Date.now()}`;
    const record = {
      id,
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test insertion from local script',
      topic: 'General help',
    };

    console.log('Inserting test row into help_requests...');
    const { data: insertData, error: insertError } = await supabase.from('help_requests').insert([record]);
    if (insertError) {
      console.error('Insert error:', insertError.message || insertError);
      process.exit(2);
    }
    console.log('Insert response:', insertData);

    console.log('\nFetching last 10 help_requests...');
    const { data, error } = await supabase.from('help_requests').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) {
      console.error('Select error:', error.message || error);
      process.exit(3);
    }
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(4);
  }
})();
