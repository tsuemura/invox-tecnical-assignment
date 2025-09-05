const { config } = require('dotenv');
const { resolve } = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Load test environment variables
config({ path: resolve(__dirname, '.env.test') });

// Remove existing test database to ensure clean state
const testDbPath = resolve(__dirname, 'prisma/test.db');
const testDbJournalPath = resolve(__dirname, 'prisma/test.db-journal');

try {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  if (fs.existsSync(testDbJournalPath)) {
    fs.unlinkSync(testDbJournalPath);
  }
} catch (error) {
  // Ignore errors if files don't exist
}

// Run migrations for test database
try {
  execSync('pnpx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
    },
    stdio: 'pipe',
  });
} catch (error) {
  console.error('Failed to run migrations:', error.message);
}