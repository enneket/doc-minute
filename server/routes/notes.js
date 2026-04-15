const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notes - 获取所有纪要（包含进度）
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
  res.json(notes);
});

// POST /api/notes - 创建新纪要
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }
  const result = db.execute('INSERT INTO notes (title) VALUES (?)', [title]);
  const note = db.queryOne('SELECT * FROM notes WHERE id = ?', [result.lastInsertRowid]);
  res.json(note);
});

// DELETE /api/notes/:id - 删除纪要
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.execute('DELETE FROM notes WHERE id = ?', [id]);
  res.json({ success: true });
});

// PUT /api/notes/:id - 更新纪要
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }
  db.execute('UPDATE notes SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, id]);
  const note = db.queryOne('SELECT * FROM notes WHERE id = ?', [id]);
  res.json(note);
});

module.exports = router;
