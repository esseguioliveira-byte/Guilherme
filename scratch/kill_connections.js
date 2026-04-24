const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function killConnections() {
  // Try to connect a few times
  let connection;
  for (let i = 0; i < 5; i++) {
    try {
      connection = await mysql.createConnection({ uri: process.env.DATABASE_URL });
      break;
    } catch (err) {
      console.log(`Attempt ${i+1} failed: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!connection) return;

  try {
    const [rows] = await connection.execute('SHOW PROCESSLIST');
    console.log(`Found ${rows.length} connections`);
    for (const row of rows) {
      if (row.Command === 'Sleep' && row.Time > 60) {
        console.log(`Killing connection ${row.Id}`);
        await connection.execute(`KILL ${row.Id}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}
killConnections();
