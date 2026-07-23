import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStock() {
  console.log('Fixing stock_quantity for all products...');
  
  const { data, error } = await supabase
    .from('products')
    .update({ stock_quantity: 100 })
    .neq('stock_quantity', 100);

  if (error) {
    console.error('Error updating stock:', error);
  } else {
    console.log('Successfully updated stock_quantity to 100 for all products.');
  }
}

fixStock();
