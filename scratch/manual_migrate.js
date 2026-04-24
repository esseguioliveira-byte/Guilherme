
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Checking users table...');
  const [columns] = await connection.execute('DESCRIBE users');
  const columnNames = columns.map(c => c.Field);
  
  const missingColumns = [
    { name: 'is_affiliate', type: 'TINYINT(1) NOT NULL DEFAULT 0' },
    { name: 'affiliate_code', type: 'VARCHAR(50) UNIQUE' },
    { name: 'referred_by', type: 'VARCHAR(255)' },
    { name: 'balance', type: 'DECIMAL(12,2) NOT NULL DEFAULT 0.00' },
    { name: 'commission_rate', type: 'DECIMAL(5,2) NOT NULL DEFAULT 5.00' }
  ];

  for (const col of missingColumns) {
    if (!columnNames.includes(col.name)) {
      console.log(`Adding column ${col.name}...`);
      await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
    }
  }

  console.log('Checking affiliate_transactions table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS affiliate_transactions (
      id VARCHAR(255) PRIMARY KEY,
      affiliate_id VARCHAR(255) NOT NULL,
      order_id VARCHAR(255),
      amount DECIMAL(12,2) NOT NULL,
      type ENUM('COMMISSION', 'WITHDRAWAL') NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (affiliate_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  console.log('Migration complete!');
  await connection.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
