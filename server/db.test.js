const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.tmpdir(), 'test-notes.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
  );
`);

// Clean up before each test
beforeEach(() => {
  db.prepare('DELETE FROM items').run();
  db.prepare('DELETE FROM notes').run();
});

// Tests
const tests = [
  {
    name: 'Create note',
    fn: () => {
      const result = db.prepare('INSERT INTO notes (title) VALUES (?)').run('Test Note');
      const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
      return note.title === 'Test Note' && note.id === result.lastInsertRowid;
    }
  },
  {
    name: 'Add item to note',
    fn: () => {
      const noteResult = db.prepare('INSERT INTO notes (title) VALUES (?)').run('Note with items');
      const itemResult = db.prepare('INSERT INTO items (note_id, content) VALUES (?, ?)').run(noteResult.lastInsertRowid, 'First item');
      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemResult.lastInsertRowid);
      return item.content === 'First item' && item.completed === 0;
    }
  },
  {
    name: 'Toggle item completed',
    fn: () => {
      const noteResult = db.prepare('INSERT INTO notes (title) VALUES (?)').run('Toggle test');
      const itemResult = db.prepare('INSERT INTO items (note_id, content) VALUES (?, ?)').run(noteResult.lastInsertRowid, 'Toggle me');
      db.prepare('UPDATE items SET completed = 1 WHERE id = ?').run(itemResult.lastInsertRowid);
      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemResult.lastInsertRowid);
      return item.completed === 1;
    }
  },
  {
    name: 'Delete note cascades to items',
    fn: () => {
      const noteResult = db.prepare('INSERT INTO notes (title) VALUES (?)').run('Cascade test');
      db.prepare('INSERT INTO items (note_id, content) VALUES (?, ?)').run(noteResult.lastInsertRowid, 'Item 1');
      db.prepare('INSERT INTO items (note_id, content) VALUES (?, ?)').run(noteResult.lastInsertRowid, 'Item 2');
      db.prepare('DELETE FROM notes WHERE id = ?').run(noteResult.lastInsertRowid);
      const remainingItems = db.prepare('SELECT * FROM items WHERE note_id = ?').all(noteResult.lastInsertRowid);
      return remainingItems.length === 0;
    }
  }
];

console.log('Running tests...\n');
let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    const result = test.fn();
    if (result) {
      console.log(`✓ ${test.name}`);
      passed++;
    } else {
      console.log(`✗ ${test.name} - assertion failed`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ${test.name} - ${err.message}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);

db.exec('DROP TABLE items');
db.exec('DROP TABLE notes');
db.close();

process.exit(failed > 0 ? 1 : 0);
