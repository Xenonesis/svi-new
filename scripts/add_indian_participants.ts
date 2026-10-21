import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config({ path: path.resolve('.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Indian First Names
const firstNames = [
  'Aarav',
  'Aditya',
  'Akash',
  'Amit',
  'Aniket',
  'Arjun',
  'Dev',
  'Gaurav',
  'Harsh',
  'Ishaan',
  'Kabir',
  'Karan',
  'Kunal',
  'Manish',
  'Mayank',
  'Nikhil',
  'Pranav',
  'Rahul',
  'Rohan',
  'Rohit',
  'Sameer',
  'Sanjay',
  'Siddharth',
  'Tushar',
  'Varun',
  'Vikram',
  'Yash',
  'Ananya',
  'Aaradhya',
  'Aditi',
  'Avani',
  'Diya',
  'Isha',
  'Kavya',
  'Meera',
  'Neha',
  'Pooja',
  'Priya',
  'Riya',
  'Sanjana',
  'Shreya',
  'Sneha',
  'Tanvi',
  'Vani',
  'Srinivas',
  'Rajesh',
  'Ramesh',
  'Suresh',
  'Mahesh',
  'Dinesh',
  'Naresh',
  'Vikash',
  'Alok',
  'Vivek',
  'Abhishek',
  'Deepak',
  'Sunil',
  'Anil',
  'Vijay',
  'Abhinav',
  'Chaitanya',
  'Darshan',
  'Gopal',
  'Hari',
  'Jitendra',
  'Ketan',
  'Lalit',
  'Manoj',
  'Naveen',
  'Pankaj',
];

// Indian Last Names
const lastNames = [
  'Sharma',
  'Verma',
  'Gupta',
  'Patel',
  'Reddy',
  'Iyer',
  'Joshi',
  'Sen',
  'Kumar',
  'Singh',
  'Das',
  'Choudhury',
  'Ranjan',
  'Prasad',
  'Mishra',
  'Pandey',
  'Dubey',
  'Trivedi',
  'Pathak',
  'Sinha',
  'Sahay',
  'Nair',
  'Pillai',
  'Menon',
  'Rao',
  'Hegde',
  'Bhat',
  'Shenoy',
  'Adiga',
  'Naidu',
  'Yadav',
  'Mehta',
  'Shah',
  'Gala',
  'Desai',
  'Kulkarni',
  'Deshmukh',
  'Chavan',
  'Patil',
  'Pawar',
];

function generateUniqueNames(count: number): string[] {
  const names = new Set<string>();
  while (names.size < count) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    names.add(`${fn} ${ln}`);
  }
  return Array.from(names);
}

async function run() {
  console.log('Fetching active lottery...');
  const { data: lottery, error: lError } = await supabase
    .from('lotteries')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lError || !lottery) {
    console.error('No active lottery campaign found to add participants to.');
    process.exit(1);
  }

  console.log(`Found active lottery: "${lottery.title}" (ID: ${lottery.id})`);

  // Safety guard: this script seeds placeholder participants for a DEMO campaign
  // only. Seeding a live campaign mixes fake entrants into a real draw, which
  // publishes fabricated winners on the public portal and dilutes real
  // participants. Refuse to touch a campaign that already has real entrants.
  const { count: existingCount, error: countError } = await supabase
    .from('lottery_participants')
    .select('id', { count: 'exact', head: true })
    .eq('lottery_id', lottery.id);

  if (countError) {
    console.error('Failed to count existing participants:', countError.message);
    process.exit(1);
  }

  if ((existingCount ?? 0) > 0) {
    console.error(
      `REFUSING TO SEED: "${lottery.title}" already has ${existingCount} participant(s). ` +
        'This script is for empty demo campaigns only — seeding a live campaign ' +
        'would mix placeholder entrants into a real draw. Create a separate demo ' +
        'campaign and re-run against it, or register real participants through the portal.'
    );
    process.exit(1);
  }

  // Generate 98 unique names
  const indianNames = generateUniqueNames(98);

  // Designate first 8 as winners, and last 90 as non-winners
  const participantsToInsert = indianNames.map((name, index) => {
    const isWinner = index < 8; // 8 winners
    const ticketIndex = 3000 + index;
    const ticketNumber = `SVI${ticketIndex}`;
    const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
    const phone = `+91 98765 ${String(43000 + index)}`;

    return {
      lottery_id: lottery.id,
      name,
      ticket_number: ticketNumber,
      phone,
      email,
      is_winner: isWinner,
      prize_rank: isWinner ? 1 : null,
    };
  });

  console.log(`Inserting 98 participants (8 winners, 90 non-winners)...`);

  const { error: insertError } = await supabase
    .from('lottery_participants')
    .insert(participantsToInsert);

  if (insertError) {
    console.error('Failed to insert participants:', insertError);
    process.exit(1);
  }

  console.log(
    'Successfully inserted 98 Indian participants (8 winners, 90 non-winners) into the active campaign!'
  );
}

run();
