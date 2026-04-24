const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  console.log('Running migration...');
  try {
    await connection.execute("ALTER TABLE `users` ADD `bio` text;");
    console.log('Migration successful!');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME' || err.message.includes('Duplicate column name')) {
      console.log('Column bio already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    await connection.end();
  }
}

run().catch(console.error);
