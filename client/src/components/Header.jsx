import React from 'react';
import axios from 'axios';

const API_BASE = '/api';

function Header() {
  const handleExport = async () => {
    const res = await axios.get(`${API_BASE}/import`);
    const data = JSON.stringify(res.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${res.data.exported_at}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>纪要</h1>
      <div style={styles.actions}>
        <button onClick={handleExport} style={styles.exportBtn}>导出</button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  exportBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default Header;
