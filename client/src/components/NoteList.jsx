import React from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function NoteList({ notes, loading, error, onEditNote, onRefresh }) {
  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('确定删除这条纪要？')) return;
    try {
      await axios.delete(`${API_BASE}/notes/${noteId}`);
      onRefresh();
    } catch (err) {
      alert('删除失败');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgress = (note) => {
    if (!note.total_items) return '0/0';
    return `${note.completed_items || 0}/${note.total_items}`;
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
    <div style={styles.list}>
      {notes.length === 0 ? (
        <div style={styles.empty}>暂无纪要，点击 + 创建</div>
      ) : (
        notes.map(note => (
          <div
            key={note.id}
            style={styles.noteCard}
            onClick={() => onEditNote(note)}
          >
            <div style={styles.noteHeader}>
              <h3 style={styles.noteTitle}>{note.title}</h3>
              <button
                onClick={(e) => handleDeleteNote(note.id, e)}
                style={styles.deleteBtn}
              >×</button>
            </div>
            <div style={styles.noteMeta}>
              <span style={styles.date}>{formatDate(note.created_at)}</span>
              <span style={styles.progress}>{getProgress(note)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  list: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '48px 0',
    fontSize: '14px',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#999',
    cursor: 'pointer',
    padding: '0 4px',
  },
  noteMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#999',
  },
  date: {},
  progress: {
    backgroundColor: '#f0f0f0',
    padding: '2px 8px',
    borderRadius: '4px',
  },
};

export default NoteList;
