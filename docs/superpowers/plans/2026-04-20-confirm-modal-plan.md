# ConfirmModal 组件实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 ConfirmModal 组件，替换 NoteModal 中所有 alert() 调用，实现风格统一的弹框体验。

**Architecture:** 新建 ConfirmModal 组件，复用 NoteModal 的遮罩和卡片样式，提供 title/message/type/onConfirm/onCancel 五个 props，confirm 和 cancel 两个按钮。

**Tech Stack:** React (jsx), inline styles (复刻 NoteModal 风格)

---

## 文件结构

- Create: `client/src/components/ConfirmModal.jsx`
- Modify: `client/src/components/NoteModal.jsx`

---

### Task 1: 创建 ConfirmModal 组件

**Files:**
- Create: `client/src/components/ConfirmModal.jsx`

- [ ] **Step 1: 创建 ConfirmModal.jsx**

```jsx
import React from 'react';

function ConfirmModal({ title, message, type = 'info', onConfirm, onCancel }) {
  const confirmColor = type === 'danger' ? '#ff4d4f' : '#1890ff';

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{title}</h2>
        </div>
        <div style={styles.body}>
          <p style={styles.message}>{message}</p>
        </div>
        <div style={styles.footer}>
          <button onClick={onCancel} style={styles.cancelBtn}>取消</button>
          <button onClick={onConfirm} style={{ ...styles.confirmBtn, backgroundColor: confirmColor }}>确认</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '360px',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  body: {
    padding: '20px',
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '14px 20px',
    borderTop: '1px solid #eee',
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default ConfirmModal;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/ConfirmModal.jsx
git commit -m "feat: add ConfirmModal component"
```

---

### Task 2: 修改 NoteModal 使用 ConfirmModal

**Files:**
- Modify: `client/src/components/NoteModal.jsx`

NoteModal 当前使用 `alert()` 的位置：
- Line 27: `alert('请输入标题')`
- Line 74: `alert('更新失败')`
- Line 87: `alert('删除失败')`
- handleDeleteItem (line 78-88): 删除前无确认框

- [ ] **Step 1: 添加 state 和 ConfirmModal 组件引入**

在 `NoteModal.jsx` 文件顶部添加：

```jsx
import ConfirmModal from './ConfirmModal';
```

在 `NoteModal` 函数组件内，items state 下方添加：

```jsx
const [confirm, setConfirm] = useState(null);
```

- [ ] **Step 2: 替换 handleSave 中的 alert**

将：
```jsx
if (!title.trim()) {
  alert('请输入标题');
  return;
}
```

替换为：
```jsx
if (!title.trim()) {
  setConfirm({ title: '提示', message: '请输入标题', type: 'info' });
  return;
}
```

- [ ] **Step 3: 替换 handleToggleItem 中的 alert**

将：
```jsx
} catch (err) {
  alert('更新失败');
}
```

替换为：
```jsx
} catch (err) {
  setConfirm({ title: '更新失败', message: '更新条目失败，请重试', type: 'info' });
}
```

- [ ] **Step 4: 替换 handleDeleteItem 中的 alert 并添加前置确认**

将整个 handleDeleteItem 函数：
```jsx
const handleDeleteItem = async (item) => {
  if (!note?.id) {
    setItems(items.filter(i => i.id !== item.id));
    return;
  }
  try {
    await axios.delete(`${API_BASE}/items/${item.id}`);
    setItems(items.filter(i => i.id !== item.id));
  } catch (err) {
    alert('删除失败');
  }
};
```

替换为：
```jsx
const handleDeleteItem = async (item) => {
  if (!note?.id) {
    setItems(items.filter(i => i.id !== item.id));
    return;
  }
  setConfirm({
    title: '确认删除',
    message: '删除后不可恢复，确定要删除吗？',
    type: 'danger',
    onConfirm: async () => {
      try {
        await axios.delete(`${API_BASE}/items/${item.id}`);
        setItems(items.filter(i => i.id !== item.id));
        setConfirm(null);
      } catch (err) {
        setConfirm({ title: '删除失败', message: '删除条目失败，请重试', type: 'info' });
      }
    },
    onCancel: () => setConfirm(null),
  });
};
```

- [ ] **Step 5: 在 NoteModal return 中添加 ConfirmModal 渲染**

在 overlay div 内部（modal div 之后）添加：

```jsx
{confirm && (
  <ConfirmModal
    title={confirm.title}
    message={confirm.message}
    type={confirm.type}
    onConfirm={confirm.onConfirm}
    onCancel={confirm.onCancel}
  />
)}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/components/NoteModal.jsx
git commit -m "feat: replace alert() calls with ConfirmModal in NoteModal"
```

---

### Task 3: 验证

- [ ] **Step 1: 启动开发服务器并测试**

```bash
cd client && npm run dev
```

测试场景：
1. 新建纪要，不输入标题点击保存 → 应显示 ConfirmModal
2. 编辑纪要，勾选条目 → 应显示 ConfirmModal
3. 删除条目 → 应显示 danger 类型确认框
4. 删除失败 → 应显示 info 类型提示框
