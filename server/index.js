const express = require('express');
const cors = require('cors');
const path = require('path');
const notesRouter = require('./routes/notes');
const itemsRouter = require('./routes/items');
const exportRouter = require('./routes/export');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5567;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/notes', notesRouter);
app.use('/api/notes', itemsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/import', exportRouter);

// 静态文件服务 (前端构建产物)
app.use(express.static(path.join(__dirname, '../client/dist')));

// 所有其他路径返回 index.html (SPA 支持)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
