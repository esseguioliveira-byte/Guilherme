const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  console.log('Running migration...');
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`site_visits\` (
        \`id\` varchar(255) PRIMARY KEY,
        \`ip\` varchar(255),
        \`user_agent\` text,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

run().catch(console.error);
