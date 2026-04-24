const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  try {
    const [rows] = await connection.execute('DESCRIBE products');
    console.log('Columns in products:', rows.map(r => r.Field));
  } catch (err) {
    console.error('Error describing products:', err.message);
  } finally {
    await connection.end();
  }
}
check();
