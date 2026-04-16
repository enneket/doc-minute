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

module.exports = router;
