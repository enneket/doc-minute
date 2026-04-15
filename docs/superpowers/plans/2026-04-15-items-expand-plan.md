# 纪要条目展开实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将条目展示在卡片外部，卡片根据条目数量自动调整高度，条目直接显示在对应卡片下方

**Architecture:** 卡片保持原有样式，下方新增条目区域。条目区域与卡片使用相同背景色，实现无缝衔接。点击卡片打开编辑弹窗，条目checkbox单独处理点击事件。

**Tech Stack:** React, axios, 内联样式

---

## Task 1: 添加条目的获取和展示

**Files:**
- Modify: `client/src/components/NoteList.jsx`

**Spec Section:** 布局结构、数据流

- [ ] **Step 1: 修改 NoteList 组件，添加 items 状态**

在 `NoteList` 组件中添加 state：
```jsx
const [itemsMap, setItemsMap] = useState({}); // { noteId: [items] }
```

- [ ] **Step 2: 添加 fetchItems 函数**

```jsx
const fetchItems = async (noteId) => {
  const res = await axios.get(`${API_BASE}/notes/${noteId}/items`);
  setItemsMap(prev => ({ ...prev, [noteId]: res.data }));
};
```

- [ ] **Step 3: 在 notes.map 中为每个 note 调用 fetchItems**

在 `NoteList` 组件的 useEffect 或初始化时获取所有条目的数据：
```jsx
useEffect(() => {
  notes.forEach(note => fetchItems(note.id));
}, [notes]);
```

- [ ] **Step 4: 修改卡片渲染结构，添加 itemsSection**

```jsx
{notes.map(note => (
  <div key={note.id}>
    <div style={styles.card} onClick={() => onEditNote(note)}>
      {/* 现有卡片内容 */}
    </div>
    {itemsMap[note.id]?.length > 0 && (
      <div style={styles.itemsSection}>
        {itemsMap[note.id].map(item => (
          <div key={item.id} style={styles.item} onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={!!item.completed}
              onChange={() => handleToggleItem(item)}
              style={styles.checkbox}
            />
            <span style={{
              ...styles.itemContent,
              textDecoration: item.completed ? 'line-through' : 'none',
              color: item.completed ? '#999' : '#333',
            }}>
              {item.content}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item);
              }}
              style={styles.deleteItemBtn}
            >×</button>
          </div>
        ))}
      </div>
    )}
  </div>
))}
```

- [ ] **Step 5: 添加 handleToggleItem 函数**

```jsx
const handleToggleItem = async (item) => {
  try {
    const res = await axios.patch(`${API_BASE}/items/${item.id}`, {
      completed: !item.completed,
    });
    // 更新本地状态
    setItemsMap(prev => ({
      ...prev,
      [item.note_id]: prev[item.note_id].map(i =>
        i.id === item.id ? res.data : i
      ),
    }));
  } catch (err) {
    alert('更新失败');
  }
};
```

- [ ] **Step 6: 添加 handleDeleteItem 函数**

```jsx
const handleDeleteItem = async (item) => {
  if (!window.confirm('确定删除这条目？')) return;
  try {
    await axios.delete(`${API_BASE}/items/${item.id}`);
    setItemsMap(prev => ({
      ...prev,
      [item.note_id]: prev[item.note_id].filter(i => i.id !== item.id),
    }));
  } catch (err) {
    alert('删除失败');
  }
};
```

- [ ] **Step 7: 添加 styles.itemsSection 和相关样式**

```jsx
itemsSection: {
  backgroundColor: '#fff',
  padding: '0 20px 16px',
  borderTop: '1px solid #f0f0f0',
},
item: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 0',
  borderBottom: '1px solid #f5f5f5',
},
itemContent: {
  flex: 1,
  fontSize: '14px',
},
deleteItemBtn: {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  color: '#ccc',
  cursor: 'pointer',
  padding: '0 4px',
},
```

- [ ] **Step 8: 修改 styles.card，移除下方圆角**

将 `borderRadius: '12px'` 改为：
```jsx
borderRadius: '12px 12px 0 0',
```

---

## Task 2: 验证和测试

**Files:**
- None (manual testing)

- [ ] **Step 1: 启动应用并验证**

```bash
# 确保 Docker 容器运行中
docker ps | grep doc-minute

# 访问 http://localhost:5567
# 验证：
# 1. 卡片显示在页面
# 2. 卡片下方显示条目列表（如有）
# 3. 条目与卡片视觉上无缝衔接
```

- [ ] **Step 2: 测试条目交互**

```
1. 点击条目的 checkbox，验证状态切换
2. 点击条目删除按钮，验证条目被删除
3. 点击卡片任意位置（除条目区域），验证打开编辑弹窗
4. 添加新条目后，验证卡片+条目区域高度自动调整
```

---

## Task 3: 提交

- [ ] **Commit changes**

```bash
git add client/src/components/NoteList.jsx
git commit -m "feat: display items below note card with auto-height adjustment

- Add items section below each note card
- Items use same background color as card for seamless appearance
- Card uses borderRadius: 12px 12px 0 0 to connect with items area
- Click on card opens edit modal, checkbox/delte clicks are isolated

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 自检清单

- [ ] Spec 中的"布局结构"有对应实现
- [ ] Spec 中的"组件变更"已实现
- [ ] Spec 中的"交互逻辑"已实现
- [ ] 无 placeholder（TODO、TBD 等）
- [ ] 类型/方法名一致性检查通过
