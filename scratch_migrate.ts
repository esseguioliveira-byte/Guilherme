import { db } from './db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Tentando adicionar a coluna delivery_email...');
    await db.execute(sql`ALTER TABLE \`orders\` ADD COLUMN \`delivery_email\` varchar(255) DEFAULT NULL AFTER \`pix_qrcode_image\``);
    console.log('Coluna adicionada com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar coluna (pode ser que já exista):', err);
  }
  process.exit(0);
}

migrate();
