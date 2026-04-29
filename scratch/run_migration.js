import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function migrate() {
  const connection = await mysql.createConnection('mysql://root:@localhost:3306/digistore');
  
  const sqlFile = fs.readFileSync(path.join(process.cwd(), 'drizzle/0003_email_queue.sql'), 'utf-8');
  const statements = sqlFile.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  
  for (const stmt of statements) {
    console.log('Executing:', stmt.substring(0, 50) + '...');
    await connection.execute(stmt);
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
