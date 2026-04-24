import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  enableKeepAlive: true,
  idleTimeout: 10000,
});


export const db = drizzle(poolConnection, { schema, mode: 'default' });
