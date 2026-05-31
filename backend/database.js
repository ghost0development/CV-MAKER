import { createClient } from '@libsql/client';

const SQLD_URL = process.env.SQLD_URL || 'http://127.0.0.1:8080';

let db = null;

export async function getDb() {
  if (db) return db;

  db = createClient({ url: SQLD_URL });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cvs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Moje CV',
      template TEXT NOT NULL DEFAULT 'modern',
      theme TEXT NOT NULL DEFAULT 'blue',
      font TEXT NOT NULL DEFAULT 'Inter',
      data JSON NOT NULL DEFAULT '{}',
      is_public INTEGER DEFAULT 0,
      share_link TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      preview_url TEXT,
      is_default INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT,
      location TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      currency TEXT DEFAULT 'PLN',
      description TEXT,
      skills_text TEXT,
      url TEXT,
      posted_at TEXT,
      scraped_at TEXT DEFAULT (datetime('now')),
      match_score INTEGER,
      match_breakdown TEXT,
      match_role TEXT,
      market_position INTEGER,
      is_applied INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const count = await db.execute('SELECT COUNT(*) as c FROM templates');
  if (!count.rows.length || count.rows[0].c === 0) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES (?, ?, ?, ?)', args: ['modern', 'Modern', 'Czysty i nowoczesny design', 1] });
    await db.execute({ sql: 'INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES (?, ?, ?, ?)', args: ['classic', 'Classic', 'Tradycyjny układ CV', 0] });
    await db.execute({ sql: 'INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES (?, ?, ?, ?)', args: ['minimal', 'Minimal', 'Prosty i elegancki', 0] });
    await db.execute({ sql: 'INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES (?, ?, ?, ?)', args: ['creative', 'Creative', 'Dla branż kreatywnych', 0] });
    await db.execute({ sql: 'INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES (?, ?, ?, ?)', args: ['executive', 'Executive', 'Dla stanowisk kierowniczych', 0] });
  }

  return db;
}

export async function run(sql, params = []) {
  const d = await getDb();
  return d.execute({ sql, args: params });
}

export async function get(sql, params = []) {
  const d = await getDb();
  const result = await d.execute({ sql, args: params });
  return result.rows.length ? result.rows[0] : undefined;
}

export async function all(sql, params = []) {
  const d = await getDb();
  const result = await d.execute({ sql, args: params });
  return result.rows;
}

export default { getDb, run, get, all };
