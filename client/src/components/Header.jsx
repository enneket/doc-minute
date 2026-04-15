import React from 'react';

function Header() {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>纪要</h1>
    </header>
  );
}

const styles = {
  header: {
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
};

export default Header;
