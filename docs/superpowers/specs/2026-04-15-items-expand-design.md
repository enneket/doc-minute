# 纪要条目展开设计 v2

## 更新说明

用户反馈：之前的实现中，同一行的卡片高度被 grid 统一了。用户希望每个卡片根据条目数量独立调整高度，形成错落的瀑布流效果。

## 设计决策

| 决策 | 选择 |
|------|------|
| 布局模式 | CSS Grid 改为 inline-block 或 flex-wrap，实现独立高度 |
| 视觉风格 | 卡片延伸 — 条目区域与卡片使用相同的背景色和圆角 |

## 布局结构

```
┌────────────────┐  ┌────────────────────┐
│ 04/15      ×  │  │ 04/15          ×  │
│ 测试会议        │  │ 较长标题的会议      │
│ ████░░  2/5   │  │ ██████░░  3/6    │
└────────────────┘  │ ○ 第一个条目        │
┌────────────────┐  │ ○ 第二个条目        │
│ ○ 第一个条目    │  │ ● 第三个条目(完成)  │
│ ○ 第二个条目    │  │ ○ 第四个条目        │
└────────────────┘  │ ○ 第五个条目        │
                    │ ○ 第六个条目        │
┌────────────────┐  └────────────────────┘
│ 04/15      ×  │
│ 另一个会议      │
│ ██░░░░  1/4   │
│ ○ 条目一       │
└────────────────┘
```

**效果：**
- 第一行两个卡片高度独立
- 第二个卡片因条目较多而更高
- 下方卡片自动向上补位（类似瀑布流）

## 实现方案

### 方案：CSS Grid + grid-auto-flow: dense

```css
grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-flow: row dense;
}
```

但这仍然会让同行卡片等高。更符合需求的方案是：

### 推荐方案：flexbox with flex-wrap

```css
flexContainer {
  display: flex;
  flexWrap: wrap;
  gap: 20px;
}

cardWrapper {
  flexBasis: 280px;
  flexGrow: 1;
  /* 让卡片宽度自适应 */
}
```

或者使用 `align-items: flex-start` 让卡片保持独立高度：

```css
grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start;  /* 关键：让卡片顶部对齐，高度由内容决定 */
}
```

## 组件变更

### NoteList.jsx

**样式调整：**
- 将 `grid` 样式改为使用 `alignItems: 'start'`
- 每个卡片外层 wrapper 保持独立

```jsx
grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  alignItems: 'start',  // 关键：卡片顶部对齐，独立高度
}
```

**卡片结构：**
- wrapper div 控制布局
- card + itemsSection 作为整体

```jsx
<div style={styles.cardWrapper}>  {/* 控制 flex 布局 */}
  <div style={styles.card} onClick={() => onEditNote(note)}>
    {/* 卡片内容 */}
  </div>
  {itemsMap[note.id]?.length > 0 && (
    <div style={styles.itemsSection}>
      {/* 条目列表 */}
    </div>
  )}
</div>
```

## 验证标准

1. 同一行卡片高度独立，不被最长卡片撑开
2. 下方卡片自动向上补位，不留空白
3. 响应式：窄屏时自动换行
4. 条目数量变化时，对应卡片高度自动调整
