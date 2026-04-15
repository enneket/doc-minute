# 纪要 (doc-minute)

简单的纪要应用，支持按条添加内容和标记完成状态。

## 技术栈

- **前端**: React + Vite
- **后端**: Node.js + Express
- **数据库**: SQLite

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 启动后端

```bash
cd server
node index.js
```

后端运行在 http://localhost:3001

### 3. 启动前端

```bash
cd client
npm run dev
```

前端运行在 http://localhost:5173

### 4. 一键启动

```bash
# 同时启动前端和后端
npm run dev
```

## 功能

- 点击 **+** 新建纪要
- 输入标题，逐条添加内容
- 每条内容左侧有复选框，点击标记完成
- 首页显示每条纪要的完成进度
- 点击纪要卡片编辑内容

## 测试

```bash
cd server
npm test
```

## 项目结构

```
doc-minute/
├── client/           # React 前端
│   └── src/
│       ├── App.jsx
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
└── README.md
```
