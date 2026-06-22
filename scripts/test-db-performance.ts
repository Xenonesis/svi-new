import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testPerformance() {
  console.log('\n=== Database Performance & Optimization Test ===\n');

  // 1. Check RPC Installation
  console.log('1. Checking get_distinct_registration_filters RPC...');
  const startRpc = performance.now();
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_distinct_registration_filters'
  );
  const endRpc = performance.now();

  if (rpcError) {
    console.log(`❌ RPC is not active or failed: ${rpcError.message}`);
    console.log('👉 Please apply the migration SQL in your Supabase SQL Editor.');
  } else {
    console.log(`✅ RPC is active! Query returned:`);
    console.log(`   - Projects: ${rpcData?.projects?.length || 0} found`);
    console.log(`   - Advisors: ${rpcData?.advisors?.length || 0} found`);
    console.log(`   - Latency (RPC): ${(endRpc - startRpc).toFixed(2)}ms`);
  }

  // 2. Measure Fallback Speed (Simulated JS query deduplication)
  console.log('\n2. Testing JS-side fallback performance...');
  const startFallback = performance.now();
  const [projects, advisors, propTypes, propSizes, plotPrefs, payPlans, payModes] =
    await Promise.all([
      supabase.from('registrations').select('project').not('project', 'is', null),
      supabase.from('registrations').select('advisor_name').not('advisor_name', 'is', null),
      supabase.from('registrations').select('property_type').not('property_type', 'is', null),
      supabase.from('registrations').select('property_size').not('property_size', 'is', null),
      supabase.from('registrations').select('plot_preference').not('plot_preference', 'is', null),
      supabase.from('registrations').select('payment_plan').not('payment_plan', 'is', null),
      supabase.from('registrations').select('payment_mode').not('payment_mode', 'is', null),
    ]);

  const unique = (arr: any[]) => [...new Set(arr)].filter(Boolean);

  const fallbackData = {
    projects: unique((projects.data || []).map((r) => r.project)),
    advisors: unique((advisors.data || []).map((r) => r.advisor_name)),
    propertyTypes: unique((propTypes.data || []).map((r) => r.property_type)),
    propertySizes: unique((propSizes.data || []).map((r) => r.property_size)),
    plotPreferences: unique((plotPrefs.data || []).map((r) => r.plot_preference)),
    paymentPlans: unique((payPlans.data || []).map((r) => r.payment_plan)),
    paymentModes: unique((payModes.data || []).map((r) => r.payment_mode)),
  };
  const endFallback = performance.now();
  const fallbackTime = endFallback - startFallback;
  console.log(`✅ JS-side fallback executed in: ${fallbackTime.toFixed(2)}ms`);

  if (!rpcError) {
    const speedup = (fallbackTime / (endRpc - startRpc)).toFixed(1);
    console.log(`🚀 DB-side RPC is ${speedup}x faster than local parallel queries!`);
  }

  // 3. Check search indexing performance
  console.log('\n3. Testing fuzzy search indexing...');
  const testSearchTerm = 'test';

  const startSearch = performance.now();
  const { data: searchData, error: searchError } = await supabase
    .from('registrations')
    .select('id, name, email')
    .or(
      `submission_id.ilike.%${testSearchTerm}%,name.ilike.%${testSearchTerm}%,last_name.ilike.%${testSearchTerm}%,email.ilike.%${testSearchTerm}%,phone.ilike.%${testSearchTerm}%,aadhar_number.ilike.%${testSearchTerm}%,advisor_name.ilike.%${testSearchTerm}%,project.ilike.%${testSearchTerm}%`
    )
    .limit(10);
  const endSearch = performance.now();

  if (searchError) {
    console.log(`❌ Search failed: ${searchError.message}`);
  } else {
    console.log(`✅ Fuzzy search executed in: ${(endSearch - startSearch).toFixed(2)}ms`);
    console.log(`   - Returned: ${searchData?.length || 0} rows`);
  }

  console.log('\n=== Test Completed ===\n');
}

testPerformance().catch(console.error);
