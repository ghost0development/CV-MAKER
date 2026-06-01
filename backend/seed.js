import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb, run, get } from './database.js';

/**
 * Seed database with test data
 */
async function seed() {
  try {
    // Initialize database
    const db = await getDb();
    console.log('✓ Database initialized');

    // Check if test user already exists
    const existingUser = await get('SELECT id FROM users WHERE email = ?', ['test@t.pl']);
    if (existingUser) {
      console.log('✓ Test user already exists, skipping creation');
      return;
    }

    // Create test user
    const testUserId = uuidv4();
    const hashedPassword = bcrypt.hashSync('test123', 10);

    await run(
      'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      [testUserId, 'test@t.pl', hashedPassword, 'Test User']
    );

    console.log('✓ Test user created successfully!');
    console.log('  Email: test@t.pl');
    console.log('  Password: test123');
    console.log('  User ID:', testUserId);

  } catch (err) {
    console.error('✗ Seed error:', err.message);
    process.exit(1);
  }
}

// Run seed
seed().then(() => {
  console.log('\n✓ Database seeding completed');
  process.exit(0);
});
