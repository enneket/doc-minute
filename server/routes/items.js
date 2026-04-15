const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notes/:noteId/items - 获取纪要的所有条目
router.get('/:noteId/items', (req, res) => {
  const { noteId } = req.params;
  const items = db.prepare(
    'SELECT * FROM items WHERE note_id = ? ORDER BY order_index ASC'
  ).all(noteId);
  res.json(items);
});

// POST /api/notes/:noteId/items - 添加条目
router.post('/:noteId/items', (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  const maxOrder = db.prepare(
    'SELECT MAX(order_index) as max FROM items WHERE note_id = ?'
  ).get(noteId);
  const orderIndex = (maxOrder.max || 0) + 1;
  const result = db.prepare(
    'INSERT INTO items (note_id, content, order_index) VALUES (?, ?, ?)'
  ).run(noteId, content, orderIndex);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.json(item);
});

// PATCH /api/items/:id - 更新条目（内容/完成状态）
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { content, completed } = req.body;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: '条目不存在' });
  }
  db.prepare(
    'UPDATE items SET content = ?, completed = ? WHERE id = ?'
  ).run(
    content !== undefined ? content : item.content,
    completed !== undefined ? (completed ? 1 : 0) : item.completed,
    id
  );
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/items/:id - 删除条目
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
