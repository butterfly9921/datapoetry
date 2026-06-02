import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'datapoetry.db');

let dbInstance: Database.Database | null = null;
let drizzleInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

export function getDrizzle() {
  if (!drizzleInstance) {
    const sqlite = getDb();
    drizzleInstance = drizzle(sqlite, { schema });
  }
  return drizzleInstance;
}

// Initialize database tables
export function initDb() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS diaries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('text', 'mood', 'checkin')),
      content TEXT NOT NULL,
      mood TEXT CHECK(mood IN ('happy', 'calm', 'anxious', 'down', 'sad')),
      activity_type TEXT CHECK(activity_type IN ('cycling', 'running', 'dancing', 'custom')),
      activity_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS diary_tags (
      diary_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (diary_id, tag_id),
      FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diary_photos (
      id TEXT PRIMARY KEY,
      diary_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS insights_log (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      message TEXT NOT NULL,
      shown_at TEXT NOT NULL,
      dismissed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS diary_references (
      id TEXT PRIMARY KEY,
      diary_id TEXT NOT NULL,
      source_type TEXT NOT NULL CHECK(source_type IN ('news', 'book', 'movie')),
      source_content TEXT NOT NULL,
      source_date TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS retrospectives (
      id TEXT PRIMARY KEY,
      period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      diary_ids TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_diaries_type ON diaries(type);
    CREATE INDEX IF NOT EXISTS idx_diaries_mood ON diaries(mood);
    CREATE INDEX IF NOT EXISTS idx_diary_tags_diary ON diary_tags(diary_id);
    CREATE INDEX IF NOT EXISTS idx_diary_tags_tag ON diary_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_insights_shown ON insights_log(shown_at, rule_id);
    CREATE INDEX IF NOT EXISTS idx_diary_refs_diary ON diary_references(diary_id);
    CREATE INDEX IF NOT EXISTS idx_diary_refs_source ON diary_references(source_type, source_date);
    CREATE INDEX IF NOT EXISTS idx_retrospectives_period ON retrospectives(period, end_date DESC);
  `);
}

// Initialize on first import
initDb();
