import { db } from './index';

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  created_at: string;
}

export function upsertUser(params: {
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
}): User {
  const existing = db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(params.telegramId) as User | undefined;

  if (existing) {
    db.prepare('UPDATE users SET username = ?, first_name = ? WHERE telegram_id = ?').run(
      params.username ?? null,
      params.firstName ?? null,
      params.telegramId,
    );
    return { ...existing, username: params.username ?? null, first_name: params.firstName ?? null };
  }

  const info = db
    .prepare('INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)')
    .run(params.telegramId, params.username ?? null, params.firstName ?? null);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as User;
}

export function getUserByTelegramId(telegramId: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as
    | User
    | undefined;
}
