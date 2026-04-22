import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  credits: integer('credits').notNull().default(100),
  tier: text('tier').notNull().default('free'), // free, pro, premium
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as integer))`),
  updatedAt: integer('updated_at').notNull().default(sql`(cast(unixepoch() as integer))`),
});

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  topic: text('topic').notNull(), // code, design, marketing, etc
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as integer))`),
  updatedAt: integer('updated_at').notNull().default(sql`(cast(unixepoch() as integer))`),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // user, assistant
  content: text('content').notNull(),
  tokensUsed: integer('tokens_used').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as integer))`),
});

export const creditTransactions = sqliteTable('credit_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // purchase, usage, bonus
  description: text('description'),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as integer))`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as integer))`),
});
