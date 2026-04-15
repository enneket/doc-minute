# 纪要 (doc-minute)

简单的纪要应用，支持按条添加内容和标记完成状态。

## 技术栈

- **前端**: React + Vite
- **后端**: Node.js + Express
- **数据库**: SQLite (sql.js)
- **容器化**: Docker

## 快速开始

### Docker 部署

```bash
# 构建镜像
docker build -t doc-minute .

# 运行容器 (数据持久化)
docker run -d --name doc-minute -p 5567:5567 -v doc-minute-data:/app/server doc-minute
```

访问 http://localhost:5567

**数据持久化**: 使用 Docker volume `doc-minute-data` 存储 SQLite 数据库，删除容器后数据不丢失。

**端口说明**: 容器内部端口 5567，映射到主机 5567

### 本地开发

```bash
# 安装依赖
cd server && npm install
cd ../client && npm install

# 启动后端 (端口 3001)
cd server && node index.js

# 启动前端 (端口 5173)
cd client && npm run dev
```

## 功能

- 点击 **+** 新建纪要
- 输入标题，逐条添加内容
- 每条内容左侧有复选框，点击标记完成
- 首页显示每条纪要的完成进度
- 点击纪要卡片编辑内容

## 项目结构

```
doc-minute/
├── client/           # React 前端
│   └── src/
│       └── components/
│           ├── Header.jsx
│           ├── NoteList.jsx
│           └── NoteModal.jsx
├── server/           # Node.js 后端
│   ├── index.js
│   ├── db.js
│   └── routes/
│       ├── notes.js
│       └── items.js
├── docs/             # 设计文档
├── Dockerfile
└── README.md
```

## API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/notes | 获取所有纪要 |
| POST | /api/notes | 创建纪要 |
| PUT | /api/notes/:id | 更新纪要 |
| DELETE | /api/notes/:id | 删除纪要 |
| GET | /api/notes/:id/items | 获取纪要条目 |
| POST | /api/notes/:id/items | 添加条目 |
| PATCH | /api/items/:id | 更新条目 |
| DELETE | /api/items/:id | 删除条目 |
