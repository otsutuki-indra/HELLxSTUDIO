import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

// Test connection
export async function testConnection() {
  try {
    const result = await client.execute('SELECT 1');
    console.log('[v0] Database connection successful');
    return true;
  } catch (error) {
    console.error('[v0] Database connection failed:', error);
    throw error;
  }
}
