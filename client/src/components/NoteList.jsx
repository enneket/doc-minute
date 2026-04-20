import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';

const API_BASE = '/api';

function NoteList({ notes, loading, error, onEditNote, onRefresh, onAddNote }) {
  const [itemsMap, setItemsMap] = useState({}); // { noteId: [items] }
  const [confirm, setConfirm] = useState(null);

  const fetchItems = async (noteId) => {
    const res = await axios.get(`${API_BASE}/notes/${noteId}/items`);
    setItemsMap(prev => ({ ...prev, [noteId]: res.data }));
  };

  useEffect(() => {
    notes.forEach(note => fetchItems(note.id));
  }, [notes]);

  const handleToggleItem = async (item) => {
    try {
      const res = await axios.patch(`${API_BASE}/items/${item.id}`, {
        completed: !item.completed,
      });
      setItemsMap(prev => ({
        ...prev,
        [item.note_id]: prev[item.note_id].map(i =>
          i.id === item.id ? res.data : i
        ),
      }));
    } catch (err) {
      setConfirm({ title: '更新失败', message: '更新条目失败，请重试', type: 'info', onConfirm: () => setConfirm(null), onCancel: () => setConfirm(null) });
    }
  };

  const handleDeleteItem = async (item) => {
    setConfirm({
      title: '确认删除',
      message: '删除后不可恢复，确定要删除吗？',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/items/${item.id}`);
          setItemsMap(prev => ({
            ...prev,
            [item.note_id]: prev[item.note_id].filter(i => i.id !== item.id),
          }));
          setConfirm(null);
        } catch (err) {
          setConfirm({ title: '删除失败', message: '删除条目失败，请重试', type: 'info', onConfirm: () => setConfirm(null), onCancel: () => setConfirm(null) });
        }
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    setConfirm({
      title: '确认删除',
      message: '删除后不可恢复，确定要删除吗？',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/notes/${noteId}`);
          onRefresh();
          setConfirm(null);
        } catch (err) {
          setConfirm({ title: '删除失败', message: '删除纪要失败，请重试', type: 'info', onConfirm: () => setConfirm(null), onCancel: () => setConfirm(null) });
        }
      },
      onCancel: () => setConfirm(null),
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getProgress = (note) => {
    if (!note.total_items) return 0;
    return Math.round((note.completed_items || 0) / note.total_items * 100);
  };

  if (loading) {
    return <div style={styles.state}>加载中...</div>;
  }

  if (error) {
    return (
      <div style={styles.state}>
        <div style={styles.error}>{error}</div>
        <button onClick={onRefresh} style={styles.retryBtn}>重试</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        <div style={styles.createCard} onClick={onAddNote}>
          <div style={styles.addIcon}>+</div>
          <div style={styles.addText}>新建纪要</div>
        </div>

        {notes.map(note => (
          <div key={note.id} style={styles.noteCard} onClick={() => onEditNote(note)}>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div style={styles.date}>{formatDate(note.created_at)}</div>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  style={styles.deleteBtn}
                >×</button>
              </div>
              <h3 style={styles.title}>{note.title}</h3>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${getProgress(note)}%`}} />
              </div>
              <div style={styles.progressText}>
                {note.completed_items || 0}/{note.total_items || 0} 已完成
              </div>
            </div>
            {itemsMap[note.id]?.map(item => (
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
        ))}
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
  container: {
    padding: '24px',
    minHeight: 'calc(100vh - 57px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    alignItems: 'start',
  },
  state: {
    textAlign: 'center',
    color: '#999',
    padding: '48px 0',
    fontSize: '14px',
  },
  error: {
    color: '#ff4d4f',
    marginBottom: '12px',
  },
  retryBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px 20px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px dashed #ddd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  addIcon: {
    fontSize: '32px',
    color: '#1890ff',
    marginBottom: '8px',
  },
  addText: {
    fontSize: '14px',
    color: '#999',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '160px',
  },
  cardContent: {
    padding: '20px',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  date: {
    fontSize: '12px',
    color: '#999',
    backgroundColor: '#f5f5f5',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#ccc',
    cursor: 'pointer',
    padding: '0 4px',
    transition: 'color 0.2s',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.4',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#52c41a',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: '#999',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    borderTop: '1px solid #f5f5f5',
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
  checkbox: {
    cursor: 'pointer',
  },
};

export default NoteList;
