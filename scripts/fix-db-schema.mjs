import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/digistore';
  console.log(`Connecting to ${url}...`);
  
  try {
    const conn = await mysql.createConnection(url);
    console.log('Connected!');

    console.log('Ensuring categories table exists...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    console.log('Ensuring products table has category_id column...');
    try {
      await conn.execute(`
        ALTER TABLE products ADD COLUMN category_id VARCHAR(255) REFERENCES categories(id)
      `);
      console.log('Added category_id to products');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('category_id already exists in products');
      } else {
        console.error('Error adding category_id:', e.message);
      }
    }

    console.log('✅ Database fix completed!');
    await conn.end();
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    console.log('\nTip: Make sure your MySQL server is running and the credentials in .env are correct.');
  }
}

main();
