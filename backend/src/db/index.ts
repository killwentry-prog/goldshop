import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const dbPath = config.databaseUrl.startsWith('.')
  ? path.resolve(process.cwd(), config.databaseUrl)
  : config.databaseUrl;

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      telegram_id INTEGER NOT NULL,
      username TEXT,
      gold_amount REAL NOT NULL,
      price_uah REAL NOT NULL,
      listing_price REAL NOT NULL,
      screenshot_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
      admin_message_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
  `);

  const defaults: Record<string, string> = {
    gold_rate_uah: String(config.goldRateUah),
    min_order_gold: String(config.minOrderGold),
    listing_markup: String(config.listingMarkup),
  };
  const insert = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (@key, @value)',
  );
  const tx = db.transaction((rows: Record<string, string>) => {
    for (const [key, value] of Object.entries(rows)) {
      insert.run({ key, value });
    }
  });
  tx(defaults);
}
