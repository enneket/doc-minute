import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteModal from './components/NoteModal';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    const res = await axios.get(`${API_BASE}/notes`);
    setNotes(res.data);
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

  const handleSaveNote = async (noteData) => {
    if (editingNote) {
      // 更新已有纪要（标题）
      await axios.put(`${API_BASE}/notes/${editingNote.id}`, { title: noteData.title });
    } else {
      // 创建新纪要
      const res = await axios.post(`${API_BASE}/notes`, { title: noteData.title });
      editingNote = { id: res.data.id };
    }
    fetchNotes();
    handleCloseModal();
  };

  return (
    <div style={styles.container}>
      <Header onAddNote={handleCreateNote} />
      <NoteList notes={notes} onEditNote={handleEditNote} onRefresh={fetchNotes} />
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
