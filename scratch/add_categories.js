const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  console.log('Criando tabela categories...');
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  console.log('Adicionando category_id à tabela products...');
  try {
    await conn.execute(`
      ALTER TABLE products ADD COLUMN category_id VARCHAR(255) REFERENCES categories(id)
    `);
  } catch (e) {
    console.log('Coluna category_id já existe ou erro:', e.message);
  }

  console.log('✅ Migração concluída!');
  await conn.end();
}

main().catch(console.error);
