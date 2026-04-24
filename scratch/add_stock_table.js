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
      CREATE TABLE IF NOT EXISTS \`stock_items\` (
        \`id\` varchar(255) PRIMARY KEY,
        \`product_id\` varchar(255) NOT NULL,
        \`order_id\` varchar(255),
        \`content\` text NOT NULL,
        \`is_sold\` tinyint(1) NOT NULL DEFAULT 0,
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
