const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  console.log('Adicionando parent_id à tabela products...');
  try {
    await conn.execute(`
      ALTER TABLE products ADD COLUMN parent_id VARCHAR(255) REFERENCES products(id)
    `);
    console.log('✅ Coluna parent_id adicionada!');
  } catch (e) {
    console.log('Coluna parent_id já existe ou erro:', e.message);
  }

  await conn.end();
}

main().catch(console.error);
