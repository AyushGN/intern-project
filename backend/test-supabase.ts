import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

const test = async () => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, orders!inner(*, users(name, email)), products!inner(name, image_url, farmer_id)')
    // .eq('products.farmer_id', userId)
    .limit(1);
    
  console.log('Farmer Query Error:', error);
  console.log('Farmer Query Data:', JSON.stringify(data, null, 2));
};

test();
