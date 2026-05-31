import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve('.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  console.log('\n--- 1. Testing portal_settings (lottery_page_visible) ---');
  try {
    const { data, error } = await supabase
      .from('portal_settings')
      .select('value')
      .eq('key', 'lottery_page_visible')
      .maybeSingle();

    if (error) {
      console.error('Error portal_settings:', error);
    } else {
      console.log('portal_settings success! Result:', data);
    }
  } catch (e) {
    console.error('Thrown error portal_settings:', e);
  }

  console.log('\n--- 2. Testing active lotteries ---');
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error lotteries:', error);
    } else {
      console.log('lotteries success! Result:', data);
    }
  } catch (e) {
    console.error('Thrown error lotteries:', e);
  }

  console.log('\n--- 3. Testing lottery_participants join on lotteries ---');
  try {
    const { data, error } = await supabase
      .from('lottery_participants')
      .select(
        `
        name, 
        ticket_number, 
        created_at,
        lotteries (title)
      `
      )
      .eq('is_winner', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error lottery_participants join:', error);
    } else {
      console.log('lottery_participants join success! Result:', data);
    }
  } catch (e) {
    console.error('Thrown error lottery_participants join:', e);
  }
}

testQueries();
