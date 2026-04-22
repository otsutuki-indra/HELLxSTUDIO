import { createClient } from '@libsql/client';

async function initDatabase() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.log('[v0] Skipping DB init - env vars not set. Will initialize on first request.');
    return;
  }

  try {
    console.log('[v0] Initializing HELLX STUDIO database...');

    const client = createClient({ url: dbUrl, authToken });

    // Create tables
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
        updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer)),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tokens_used INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer)),
        FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS credit_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer)),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() as integer)),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    ];

    for (const sql of tables) {
      await client.execute(sql);
    }

    // Create indexes for concurrent user handling
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
      await client.execute(sql);
    }

    console.log('[v0] Database initialized successfully');
  } catch (error) {
    console.error('[v0] Database initialization error:', error);
  }
}

initDatabase();
