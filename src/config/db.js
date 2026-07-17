import 'dotenv/config';
import { Pool } from 'pg';

// Configure the pool using env vars
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  // Log unexpected errors on idle clients
  // eslint-disable-next-line no-console
  console.error('Unexpected Postgres client error', err);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

export default pool;
