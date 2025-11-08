import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Run migrations
    const { stdout: migrateOut, stderr: migrateErr } = await execAsync('npx prisma migrate deploy');
    console.log('Migration output:', migrateOut);
    if (migrateErr) console.error('Migration errors:', migrateErr);

    console.log('✅ Migrations completed!');

    // Run seed
    console.log('Starting database seed...');
    const { stdout: seedOut, stderr: seedErr } = await execAsync('npm run seed');
    console.log('Seed output:', seedOut);
    if (seedErr) console.error('Seed errors:', seedErr);

    console.log('✅ Seed completed!');
    console.log('🎉 Database setup complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigrations();
