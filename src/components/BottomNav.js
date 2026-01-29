import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/home', emoji: '🏠', label: 'Home' },
  { path: '/messages', emoji: '💬', label: 'Messages' },
  { path: '/camera', emoji: '📷', label: 'Camera' },
  { path: '/profile', emoji: '👤', label: 'Profile' },
  { path: '/settings', emoji: '⚙️', label: 'Settings' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={styles.container}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.emoji}>{item.emoji}</span>
            <span style={{
              ...styles.label,
              ...(isActive ? styles.labelActive : {}),
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '414px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E0E0E0',
    padding: '8px 0 12px 0',
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    minWidth: '60px',
  },
  navItemActive: {
    backgroundColor: '#F5E6D3',
  },
  emoji: {
    fontSize: '24px',
    marginBottom: '2px',
  },
  label: {
    fontSize: '11px',
    color: '#666666',
    fontWeight: '500',
  },
  labelActive: {
    color: '#000000',
    fontWeight: '600',
  },
};

export default BottomNav;
