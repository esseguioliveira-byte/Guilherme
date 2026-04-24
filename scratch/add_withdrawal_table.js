// Run: node scratch/add_withdrawal_table.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id VARCHAR(255) PRIMARY KEY,
      affiliate_id VARCHAR(255) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      pix_key VARCHAR(255) NOT NULL,
      pix_key_type ENUM('CPF','CNPJ','EMAIL','PHONE','RANDOM') NOT NULL,
      status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
      admin_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      resolved_at TIMESTAMP NULL,
      FOREIGN KEY (affiliate_id) REFERENCES users(id)
    )
  `);

  console.log('✅ withdrawal_requests table created!');
  await conn.end();
}

main().catch(console.error);
