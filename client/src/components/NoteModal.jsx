import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function NoteModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [items, setItems] = useState([]);
  const [newItemContent, setNewItemContent] = useState('');

  useEffect(() => {
    if (note?.id) {
      fetchItems();
    }
  }, [note]);

  const fetchItems = async () => {
    const res = await axios.get(`${API_BASE}/notes/${note.id}/items`);
    setItems(res.data);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }

    if (note?.id) {
      // 更新已有纪要
      // nothing to update for note title in this simple impl
      onSave();
    } else {
      // 创建新纪要 + items
      const res = await axios.post(`${API_BASE}/notes`, { title });
      const newNoteId = res.data.id;
      // 添加所有 items
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
    setItems([...items, { id: Date.now(), content: newItemContent, completed: false }]);
    setNewItemContent('');
  };

  const handleToggleItem = async (item) => {
    if (!note?.id) {
      setItems(items.map(i =>
        i.id === item.id ? { ...i, completed: !i.completed } : i
      ));
      return;
    }
    const res = await axios.patch(`${API_BASE}/items/${item.id}`, {
      completed: !item.completed,
    });
    setItems(items.map(i => i.id === item.id ? res.data : i));
  };

  const handleDeleteItem = async (item) => {
    if (!note?.id) {
      setItems(items.filter(i => i.id !== item.id));
      return;
    }
    await axios.delete(`${API_BASE}/items/${item.id}`);
    setItems(items.filter(i => i.id !== item.id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
              onKeyPress={handleKeyPress}
              placeholder="添加条目..."
              style={styles.addItemInput}
            />
            <button onClick={handleAddItem} style={styles.addItemBtn}>添加</button>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>取消</button>
          <button onClick={handleSave} style={styles.saveBtn}>保存</button>
        </div>
      </div>
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
    width: '500px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#999',
    cursor: 'pointer',
  },
  body: {
    padding: '20px',
    flex: 1,
    overflow: 'auto',
  },
  titleInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    fontSize: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  itemContent: {
    flex: 1,
    fontSize: '14px',
  },
  deleteItemBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#999',
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
    border: '1px solid #e0e0e0',
    fontSize: '14px',
  },
  addItemBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#1890ff',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
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
