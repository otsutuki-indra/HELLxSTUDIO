import { createClient } from '@libsql/client';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key');
const JWT_EXPIRATION = 7 * 24 * 60 * 60; // 7 days

let clientInstance: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!clientInstance) {
    const dbUrl = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!dbUrl || !authToken) {
      throw new Error('Database credentials not configured');
    }

    clientInstance = createClient({ url: dbUrl, authToken });
  }
  return clientInstance;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + JWT_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string };
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const client = getClient();
  const sessionId = uuidv4();
  const token = await generateToken(userId);
  const expiresAt = Math.floor(Date.now() / 1000) + JWT_EXPIRATION;

  await client.execute({
    sql: `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
    args: [sessionId, userId, token, expiresAt],
  });

  return token;
}

export async function verifySession(token: string): Promise<string | null> {
  const client = getClient();
  const result = await client.execute({
    sql: `SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?`,
    args: [token, Math.floor(Date.now() / 1000)],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0].user_id as string;
}

export async function revokeSession(token: string): Promise<void> {
  const client = getClient();
  await client.execute({
    sql: `DELETE FROM sessions WHERE token = ?`,
    args: [token],
  });
}

export async function getUserById(userId: string) {
  const client = getClient();
  const result = await client.execute({
    sql: `SELECT id, email, username, credits, tier, avatar_url FROM users WHERE id = ?`,
    args: [userId],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const client = getClient();
  const result = await client.execute({
    sql: `SELECT * FROM users WHERE email = ?`,
    args: [email],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function createUser(email: string, username: string, passwordHash: string) {
  const client = getClient();
  const userId = uuidv4();

  await client.execute({
    sql: `INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)`,
    args: [userId, email, username, passwordHash],
  });

  return { id: userId, email, username, credits: 100, tier: 'free' };
}

export async function deductCredits(userId: string, amount: number, reason: string) {
  const client = getClient();
  const txId = uuidv4();

  await client.batch([
    {
      sql: `UPDATE users SET credits = credits - ? WHERE id = ?`,
      args: [amount, userId],
    },
    {
      sql: `INSERT INTO credit_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)`,
      args: [txId, userId, -amount, 'usage', reason],
    },
  ]);
}

export async function ensureDatabase() {
  const client = getClient();
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 100,
      tier TEXT NOT NULL DEFAULT 'free',
      avatar_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer))
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer))
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer))
    )`,
    `CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer))
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer))
    )`,
  ];

  for (const sql of tables) {
    try {
      await client.execute(sql);
    } catch {
      // Table already exists
    }
  }

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
  ];

  for (const sql of indexes) {
    try {
      await client.execute(sql);
    } catch {
      // Index already exists
    }
  }
}
