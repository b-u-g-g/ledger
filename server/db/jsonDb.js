/**
 * Data access layer.
 * Wraps all read/write operations on data.json so the rest of the app
 * never touches the filesystem directly. Swap this module for a real
 * DB adapter (SQLite, Postgres, etc.) without changing any controller.
 */

const fs = require('fs');
const path = require('path');

// data.json lives at the repo root, two levels up from server/db/
const DB_PATH = path.join(__dirname, '..', '..', 'data.json');

/** Read the entire DB and return a parsed object. */
function read() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (err) {
    throw new Error(`Failed to read database: ${err.message}`);
  }
}

/** Persist a full DB object back to disk. */
function write(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Failed to write database: ${err.message}`);
  }
}

/** Generate a unique ID with a readable prefix (e.g. "task_", "client_"). */
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

module.exports = { read, write, generateId };
