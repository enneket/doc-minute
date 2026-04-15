const express = require('express');
const cors = require('cors');
const notesRouter = require('./routes/notes');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// notes 路由: /api/notes, /api/notes/:id
app.use('/api/notes', notesRouter);

// items 路由同时挂载到两个路径:
// - /api/notes/:noteId/items (GET, POST)
// - /api/items/:id (PATCH, DELETE)
app.use('/api/notes', itemsRouter);
app.use('/api/items', itemsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
