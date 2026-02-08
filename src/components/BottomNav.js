import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMessageStore } from '../store/messageStore';

const navItems = [
  { path: '/home', emoji: '🏠', label: 'Home' },
  { path: '/messages', emoji: '💬', label: 'Messages' },
  { path: '/camera', emoji: '📷', label: 'Camera' },
  { path: '/calendar', emoji: '📅', label: 'Calendar' },
  { path: '/profile', emoji: '👤', label: 'Profile' },
  { path: '/settings', emoji: '⚙️', label: 'Settings' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const totalUnreadCount = useMessageStore((s) => s.totalUnreadCount);

  return (
    <nav style={styles.container}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const showBadge = item.path === '/messages' && totalUnreadCount > 0;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            }}
          >
            <span style={{ ...styles.emoji, position: 'relative' }}>
              {item.emoji}
              {showBadge && (
                <span style={styles.badge}>
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </span>
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
    backgroundColor: 'var(--nav-bg)',
    borderRadius: '20px 20px 0 0',
    borderTop: '1px solid var(--nav-border)',
    padding: '12px 8px calc(14px + env(safe-area-inset-bottom, 0px)) 8px',
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    minWidth: '60px',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'var(--nav-active-bg)',
  },
  emoji: {
    fontSize: '24px',
    marginBottom: '2px',
  },
  label: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  labelActive: {
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    lineHeight: 1,
    boxSizing: 'border-box',
  },
};

export default BottomNav;
