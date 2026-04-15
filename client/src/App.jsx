import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteModal from './components/NoteModal';
import axios from 'axios';

const API_BASE = '/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/notes`);
      setNotes(res.data);
    } catch (err) {
      setError('加载失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = () => {
    fetchNotes();
    handleCloseModal();
  };

  return (
    <div style={styles.container}>
      <Header />
      <NoteList
        notes={notes}
        loading={loading}
        error={error}
        onEditNote={handleEditNote}
        onRefresh={fetchNotes}
        onAddNote={handleCreateNote}
      />
      {modalOpen && (
        <NoteModal
          note={editingNote}
          onSave={handleSaveNote}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
};

export default App;
