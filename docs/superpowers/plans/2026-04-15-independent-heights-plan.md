# 卡片独立高度实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修改 CSS Grid 布局，让每个卡片根据内容独立调整高度，不被同行卡片撑开

**Architecture:** 在 CSS Grid 中添加 `alignItems: 'start'`，让卡片顶部对齐而非拉伸等高，形成错落的瀑布流效果

**Tech Stack:** React, 内联样式

---

## Task 1: 修改 grid 样式

**Files:**
- Modify: `client/src/components/NoteList.jsx`

**Spec Section:** 实现方案

- [ ] **Step 1: 修改 grid 样式，添加 alignItems: 'start'**

在 `styles` 对象中找到 `grid` 样式，添加 `alignItems: 'start'`

当前代码（约第150-154行）：
```jsx
grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
},
```

修改为：
```jsx
grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  alignItems: 'start',
},
```

---

## Task 2: 构建和验证

- [ ] **Step 1: 构建前端**

```bash
cd /home/zjx/code/mine/doc-minute/client && npm run build
```

- [ ] **Step 2: 重新部署**

```bash
cd /home/zjx/code/mine/doc-minute && docker stop doc-minute && docker rm doc-minute && docker build -t doc-minute . && docker run -d --name doc-minute -p 5567:5567 doc-minute
```

- [ ] **Step 3: 验证效果**

访问 http://localhost:5567，创建多个笔记并添加不同数量的条目，验证：
1. 同一行卡片高度独立，不被最长卡片撑开
2. 下方卡片自动向上补位

---

## Task 3: 提交

- [ ] **Commit changes**

```bash
git add client/src/components/NoteList.jsx
git commit -m "fix: use alignItems-start for independent card heights in grid

- Cards now align to top and grow independently based on content
- Creates masonry-like effect with items expanded below each card

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 自检清单

- [ ] Spec 中的"布局结构"有对应实现
- [ ] `alignItems: 'start'` 已添加到 grid 样式
- [ ] 无 placeholder
