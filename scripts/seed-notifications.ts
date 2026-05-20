import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seedNotifications() {
  console.log('=== Seeding Sample Notifications ===\n');

  const { supabaseAdmin } = await import('../src/lib/supabase/admin.js');

  // Get all admin users
  const { data: admins, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'admin');

  if (fetchError) {
    console.error('Error fetching admins:', fetchError);
    return;
  }

  if (!admins || admins.length === 0) {
    console.log('No admin users found. Please create an admin user first.');
    return;
  }

  console.log(`Found ${admins.length} admin user(s)\n`);

  // Sample notifications to create
  const sampleNotifications = [
    {
      title: 'Welcome to SVI Admin Portal',
      message:
        'Your admin account has been successfully created. You can now manage users and generate documents.',
      type: 'success',
    },
    {
      title: 'New Feature Available',
      message:
        'Real-time notifications are now enabled. You will receive updates about user activities and system events.',
      type: 'info',
    },
    {
      title: 'Security Reminder',
      message:
        'Please ensure you use strong passwords and enable two-factor authentication for enhanced security.',
      type: 'warning',
    },
    {
      title: 'System Maintenance Scheduled',
      message:
        'Scheduled maintenance will occur on Sunday at 2 AM IST. The system may be temporarily unavailable.',
      type: 'info',
    },
  ];

  // Create notifications for each admin
  for (const admin of admins) {
    console.log(`Creating notifications for: ${admin.full_name} (${admin.id})`);

    for (const notification of sampleNotifications) {
      const { data, error } = await supabaseAdmin.from('notifications').insert([
        {
          user_id: admin.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
          metadata: { seeded: true },
        },
      ]);

      if (error) {
        console.error(`Error creating notification: ${error.message}`);
      } else {
        console.log(`✓ Created: "${notification.title}"`);
      }

      // Small delay to stagger timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('');
  }

  console.log('✅ Notification seeding complete!');
  console.log('\nYou can now view notifications in the admin portal by clicking the bell icon.');
}

seedNotifications().catch(console.error);
