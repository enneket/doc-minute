# 数据导入导出实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为纪要应用添加 JSON 格式的数据导入导出功能

**Architecture:** 后端新增 export.js 路由处理导入导出 API，前端 Header 组件添加导入导出按钮

**Tech Stack:** React, Express, sql.js

---

## Task 1: 创建后端导出 API

**Files:**
- Create: `server/routes/export.js`
- Modify: `server/index.js:4-7`

- [ ] **Step 1: 创建 server/routes/export.js**

```javascript
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
```

- [ ] **Step 2: 在 server/index.js 注册路由**

在 `const itemsRouter = require('./routes/items');` 后添加：
```javascript
const exportRouter = require('./routes/export');
```

在 `app.use('/api/items', itemsRouter);` 后添加：
```javascript
app.use('/api/export', exportRouter);
```

- [ ] **Step 3: 验证导出 API**

```bash
curl http://localhost:5567/api/export
```

应返回 JSON 格式的导出数据

- [ ] **Step 4: Commit**

```bash
git add server/routes/export.js server/index.js
git commit -m "feat: add export API endpoint"
```

---

## Task 2: 创建后端导入 API

**Files:**
- Modify: `server/routes/export.js`

- [ ] **Step 1: 添加 POST /api/import 端点**

在 `server/routes/export.js` 的 `module.exports` 前添加：

```javascript
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
```

- [ ] **Step 2: 验证导入 API**

```bash
curl -X POST http://localhost:5567/api/import \
  -H "Content-Type: application/json" \
  -d '{"notes":[{"title":"测试","created_at":"2026-04-16","items":[{"content":"条目1","completed":false}]}]}'
```

- [ ] **Step 3: Commit**

```bash
git add server/routes/export.js
git commit -m "feat: add import API endpoint"
```

---

## Task 3: 前端导出功能

**Files:**
- Modify: `client/src/components/Header.jsx`

- [ ] **Step 1: 修改 Header.jsx 添加导出按钮**

```javascript
import React from 'react';
import axios from 'axios';

const API_BASE = '/api';

function Header() {
  const handleExport = async () => {
    const res = await axios.get(`${API_BASE}/export`);
    const data = JSON.stringify(res.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${res.data.exported_at}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>纪要</h1>
      <div style={styles.actions}>
        <button onClick={handleExport} style={styles.exportBtn}>导出</button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  exportBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default Header;
```

- [ ] **Step 2: 构建验证**

```bash
cd client && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Header.jsx
git commit -m "feat: add export button to Header"
```

---

## Task 4: 前端导入功能

**Files:**
- Modify: `client/src/components/Header.jsx`

- [ ] **Step 1: 添加导入按钮和处理函数**

在 `handleExport` 后添加 `handleImport`：

```javascript
const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    try {
      const data = JSON.parse(text);
      await axios.post(`${API_BASE}/import`, data);
      alert('导入成功');
      window.location.reload();
    } catch (err) {
      alert('导入失败：' + err.message);
    }
  };
  input.click();
};
```

在 `exportBtn` 后添加导入按钮：

```jsx
<button onClick={handleImport} style={styles.importBtn}>导入</button>
```

添加 `importBtn` 样式：

```javascript
importBtn: {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  color: '#666',
  fontSize: '14px',
  cursor: 'pointer',
},
```

- [ ] **Step 2: 构建验证**

```bash
cd client && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Header.jsx
git commit -m "feat: add import button to Header"
```

---

## Task 5: 构建部署验证

- [ ] **Step 1: 重新构建 Docker 镜像**

```bash
docker compose down && docker compose up -d --build
```

- [ ] **Step 2: 验证功能**

1. 访问 http://localhost:5567
2. 点击"导出"按钮，确认下载 JSON 文件
3. 验证 JSON 文件内容正确

- [ ] **Step 3: 打标签**

```bash
git tag v1.1.0 && git push origin v1.1.0
```

---

## 自检清单

- [ ] GET /api/export 返回正确格式的 JSON
- [ ] POST /api/import 正确解析并写入数据
- [ ] 重复导入相同数据会被跳过（去重）
- [ ] 导出按钮下载 JSON 文件
- [ ] 导入按钮选择文件并上传
- [ ] Docker 部署正常运行
