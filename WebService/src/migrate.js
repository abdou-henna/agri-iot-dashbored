import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const sqlDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../sql');

const migrations = [
  '001_init.sql',
  '002_patch.sql',
  '003_agronomic.sql',
];

export async function migrateDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required for database migration');
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  let client;
  try {
    client = await pool.connect();
    for (const file of migrations) {
      const sql = await fs.readFile(path.join(sqlDir, file), 'utf8');
      await client.query(sql);
      console.log(`Migration applied: ${file}`);
    }
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Database schema migration failed:', error.message || error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

const resolvedArg = process.argv[1] ? path.resolve(process.cwd(), process.argv[1]) : '';
if (resolvedArg === fileURLToPath(import.meta.url)) {
  migrateDatabase().catch(() => {
    process.exit(1);
  });
}
