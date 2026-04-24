const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Add stylepay_payment_id and pix_qrcode_image columns to orders table
  try {
    await conn.execute(`ALTER TABLE orders ADD COLUMN stylepay_payment_id VARCHAR(255) NULL`);
    console.log('Added stylepay_payment_id column');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('stylepay_payment_id already exists, skipping');
    } else throw e;
  }

  try {
    await conn.execute(`ALTER TABLE orders ADD COLUMN pix_qrcode_image LONGTEXT NULL`);
    console.log('Added pix_qrcode_image column');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('pix_qrcode_image already exists, skipping');
    } else throw e;
  }

  console.log('Migration complete!');
  await conn.end();
}

main().catch(console.error);
