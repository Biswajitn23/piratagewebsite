import fs from "fs";
import path from "path";

let db: any | null = null;

export async function getDb() {
  if (db) return db;
  // Dynamically import to avoid compile-time dependency
  let DatabaseMod: any;
  try {
    DatabaseMod = (await import("better-sqlite3")).default;
  } catch (e) {
    throw new Error(
      "Database driver not installed. Please install 'better-sqlite3' to enable events persistence."
    );
  }

  const dbPath = process.env.DATABASE_PATH || ".data/app.db";
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  db = new DatabaseMod(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      coverImage TEXT NOT NULL,
      gallery TEXT NOT NULL, -- JSON array
      description TEXT NOT NULL,
      speakers TEXT NOT NULL, -- JSON array
      registrationLink TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      highlightScene TEXT
    );
  `);

  return db;
}
