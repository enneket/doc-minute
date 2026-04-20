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
