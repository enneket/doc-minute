const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/export - 导出所有数据为 JSON
router.get('/', (req, res) => {
  const notes = db.query(`
    SELECT n.*,
      COUNT(i.id) as total_items,
      SUM(CASE WHEN i.completed = 1 THEN 1 ELSE 0 END) as completed_items
    FROM notes n
    LEFT JOIN items i ON n.id = i.note_id
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `);

  const result = {
    exported_at: new Date().toISOString().split('T')[0],
    notes: []
  };

  for (const note of notes) {
    const items = db.query('SELECT * FROM items WHERE note_id = ? ORDER BY order_index', [note.id]);
    result.notes.push({
      title: note.title,
      created_at: note.created_at,
      items: items.map(item => ({
        content: item.content,
        completed: !!item.completed
      }))
    });
  }

  res.json(result);
});

// POST /api/import - 导入 JSON 数据
router.post('/', (req, res) => {
  const { notes } = req.body;

  if (!notes || !Array.isArray(notes)) {
    return res.status(400).json({ error: 'Invalid format' });
  }

  let imported = 0;
  let skipped = 0;

  for (const note of notes) {
    // 检查是否已存在 (按 title + created_at 去重)
    const existing = db.queryOne(
      'SELECT id FROM notes WHERE title = ? AND created_at = ?',
      [note.title, note.created_at]
    );

    if (existing) {
      skipped++;
      continue;
    }

    // 插入笔记
    const result = db.execute('INSERT INTO notes (title, created_at) VALUES (?, ?)', [note.title, note.created_at]);
    const noteId = result.lastInsertRowid;

    // 插入条目
    for (let i = 0; i < note.items.length; i++) {
      const item = note.items[i];
      db.execute(
        'INSERT INTO items (note_id, content, completed, order_index) VALUES (?, ?, ?, ?)',
        [noteId, item.content, item.completed ? 1 : 0, i]
      );
    }

    imported++;
  }

  res.json({ success: true, imported, skipped });
});

module.exports = router;
