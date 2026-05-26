import { supabase } from './src/config/supabase';

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Users:', data, error);
  
  // What if we try to insert into a non-existent table?
  const { data: d2, error: e2 } = await supabase.from('notifications').select('*').limit(1);
  console.log('Notifications:', e2?.message);
}

check();
