const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  console.log('Running coupons migration...');
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`coupons\` (
        \`id\` varchar(255) PRIMARY KEY,
        \`code\` varchar(50) UNIQUE NOT NULL,
        \`type\` enum('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
        \`value\` decimal(10,2) NOT NULL,
        \`min_order_amount\` decimal(10,2) NOT NULL DEFAULT 0.00,
        \`max_uses\` int DEFAULT NULL,
        \`current_uses\` int NOT NULL DEFAULT 0,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`expires_at\` timestamp NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Coupons table created!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}
run().catch(console.error);
