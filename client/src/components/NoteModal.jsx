import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';

const API_BASE = '/api';

function NoteModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [items, setItems] = useState([]);
  const [newItemContent, setNewItemContent] = useState('');
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setTitle(note?.title || '');
    setItems([]);
    setNewItemContent('');
    if (note?.id) {
      fetchItems();
    }
  }, [note?.id]);

  const fetchItems = async () => {
    const res = await axios.get(`${API_BASE}/notes/${note.id}/items`);
    setItems(res.data);
  };

const handleSave = async () => {
    if (!title.trim()) {
      setConfirm({ title: '提示', message: '请输入标题', type: 'info' });
      return;
    }

    if (note?.id) {
      await axios.put(`${API_BASE}/notes/${note.id}`, { title });
      // 保存新添加的 items（临时id的条目）
      for (const item of items) {
        if (!item.id || item.id > 1000000000) {
          await axios.post(`${API_BASE}/notes/${note.id}/items`, {
            content: item.content,
          });
        }
      }
      onSave();
    } else {
      const res = await axios.post(`${API_BASE}/notes`, { title });
      const newNoteId = res.data.id;
      for (const item of items) {
        await axios.post(`${API_BASE}/notes/${newNoteId}/items`, {
          content: item.content,
        });
      }
      onSave();
    }
  };

  const handleAddItem = () => {
    if (!newItemContent.trim()) return;
    const newItem = { id: Date.now(), content: newItemContent, completed: false };
    setItems([...items, newItem]);
    setNewItemContent('');
  };

  const handleToggleItem = async (item) => {
    if (!note?.id) {
      setItems(items.map(i =>
        i.id === item.id ? { ...i, completed: !i.completed } : i
      ));
      return;
    }
    try {
      const res = await axios.patch(`${API_BASE}/items/${item.id}`, {
        completed: !item.completed,
      });
      setItems(items.map(i => i.id === item.id ? res.data : i));
    } catch (err) {
      setConfirm({ title: '更新失败', message: '更新条目失败，请重试', type: 'info' });
    }
  };

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
          setConfirm({ title: '删除失败', message: '删除条目失败，请重试', type: 'info', onConfirm: () => setConfirm(null) });
        }
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{note ? '编辑纪要' : '新建纪要'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.body}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="纪要标题"
            style={styles.titleInput}
          />

          <div style={styles.itemsList}>
            {items.map(item => (
              <div key={item.id} style={styles.item}>
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
                  onClick={() => handleDeleteItem(item)}
                  style={styles.deleteItemBtn}
                >×</button>
              </div>
            ))}
          </div>

          <div style={styles.addItem}>
            <input
              type="text"
              value={newItemContent}
              onChange={e => setNewItemContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加条目..."
              style={styles.addItemInput}
            />
            <button onClick={handleAddItem} style={styles.addBtn}>添加</button>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>取消</button>
          <button onClick={handleSave} style={styles.saveBtn}>保存</button>
        </div>
      </div>
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          type={confirm.type}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '420px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#999',
    cursor: 'pointer',
  },
  body: {
    padding: '16px 20px',
    flex: 1,
    overflow: 'auto',
  },
  titleInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
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
  },
  addItem: {
    display: 'flex',
    gap: '8px',
  },
  addItemInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  addBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
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
  saveBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#1890ff',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default NoteModal;
