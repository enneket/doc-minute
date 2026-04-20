# ConfirmModal 组件设计

## 背景

NoteModal 使用了风格统一的半透明遮罩 + 居中白色卡片设计，但其中的 alert() 调用使用浏览器原生弹框，视觉风格不一致。

## 设计目标

将 NoteModal 中所有 alert() 替换为风格统一的 ConfirmModal 组件。

## ConfirmModal 组件设计

### Props
- `title`: string - 弹框标题
- `message`: string - 描述文字
- `type`: 'danger' | 'info' - 确认按钮样式
- `onConfirm`: () => void - 确认回调
- `onCancel`: () => void - 取消回调

### 样式
- 复刻 NoteModal 的遮罩和卡片样式
- 危险操作使用红色确认按钮（#ff4d4f）
- 普通操作使用蓝色确认按钮（#1890ff）
- 取消按钮使用灰色边框样式

## 替换场景

NoteModal 中以下 alert() 调用需替换：

| 位置 | 当前 | 替换为 |
|------|------|--------|
| handleSave 标题为空 | `alert('请输入标题')` | ConfirmModal info |
| handleToggleItem 失败 | `alert('更新失败')` | ConfirmModal info |
| handleDeleteItem 失败 | `alert('删除失败')` | ConfirmModal info |
| handleDeleteItem 前置确认 | 无 | ConfirmModal danger |

## 文件改动

1. 新增 `client/src/components/ConfirmModal.jsx`
2. 修改 `client/src/components/NoteModal.jsx` 引入并使用 ConfirmModal
