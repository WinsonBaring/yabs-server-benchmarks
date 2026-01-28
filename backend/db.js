const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/benchmarks.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    provider TEXT,
    location TEXT,
    cpu_model TEXT,
    cpu_cores INTEGER,
    cpu_freq TEXT,
    ram_total TEXT,
    disk_total TEXT,
    raw_data TEXT -- Full JSON from YABS
  )
`);

module.exports = db;
