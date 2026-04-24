const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id VARCHAR(255) PRIMARY KEY,
      provider VARCHAR(50) NOT NULL DEFAULT 'stylepay',
      client_id TEXT NOT NULL,
      client_secret TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      webhook_secret TEXT,
      environment ENUM('sandbox', 'production') NOT NULL DEFAULT 'production',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Table payment_settings created/verified!');
  await conn.end();
}

main().catch(console.error);
