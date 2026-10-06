import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('lifesync.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'routine', 'todo', 'goal'
      lastDoneDate TEXT,
      nextDueDate TEXT,
      periodValue INTEGER,
      periodUnit TEXT, -- 'days', 'weeks', 'months'
      isImportant INTEGER DEFAULT 0,
      routineType TEXT DEFAULT 'relative'
    );
  `);
  
  // 기존 DB에 routineType 컬럼이 없다면 추가 (마이그레이션)
  try {
    db.execSync("ALTER TABLE tasks ADD COLUMN routineType TEXT DEFAULT 'relative';");
  } catch (e) {
    // 이미 존재하는 경우 무시
  }
};
