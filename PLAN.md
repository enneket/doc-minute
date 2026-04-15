# 纪要应用实现计划

**日期:** 2026-04-15
**项目:** doc-minute
**状态:** 计划阶段

---

## 1. 项目初始化

### 1.1 初始化前端
- 创建 React + Vite 项目 (`client/`)
- 安装依赖: axios
- 配置项目结构

### 1.2 初始化后端
- 创建 Node.js + Express 项目 (`server/`)
- 安装依赖: express, better-sqlite3, cors
- 初始化 SQLite 数据库

---

## 2. 后端实现

### 2.1 数据库层 (`server/db.js`)
- 连接 SQLite 数据库
- 创建 notes 和 items 表

### 2.2 API 路由

#### notes 路由 (`server/routes/notes.js`)
- `GET /api/notes` - 获取所有纪要（包含进度）
- `POST /api/notes` - 创建纪要
- `DELETE /api/notes/:id` - 删除纪要（级联删除 items）

#### items 路由 (`server/routes/items.js`)
- `GET /api/notes/:id/items` - 获取纪要的所有条目
- `POST /api/notes/:id/items` - 添加条目
- `PATCH /api/items/:id` - 更新条目（内容/完成状态）
- `DELETE /api/items/:id` - 删除条目

---

## 3. 前端实现

### 3.1 组件结构

#### Header.jsx
- 显示标题 + 加号按钮

#### NoteList.jsx
- 展示纪要列表
- 每行显示: 标题、创建时间、完成进度
- 点击纪要打开详情弹框

#### NoteModal.jsx
- 模态框: 标题输入 + 条目列表
- 逐条添加条目
- 每条可标记完成
- 保存/取消按钮

#### ItemRow.jsx
- 单条纪要行
- 复选框 + 内容文本
- 删除按钮

### 3.2 状态管理
- useState/useReducer 管理 notes 列表
- 弹框开合状态
- 编辑中的纪要数据

### 3.3 API 调用
- 使用 axios 与后端通信
- 统一的错误处理

---

## 4. 样式

- 使用 CSS Modules 或内联样式
- 简约实用主义
- 灰白配色 + 主色强调

---

## 5. 测试计划

### 5.1 后端测试
- API 端点测试 (REST)
- 数据库 CRUD 测试

### 5.2 前端测试
- 组件渲染测试
- 用户交互测试

---

## 6. 交付物

- 完整的 React 前端 (`client/`)
- 完整的 Node.js 后端 (`server/`)
- SQLite 数据库文件
- 设计文档 (`docs/superpowers/specs/`)
