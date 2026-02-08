import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../utils/useTheme';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();
  const { isDark, toggleTheme } = useTheme();

  const settingsItems = [
    { icon: '👤', label: 'Account', path: '/profile' },
    { icon: '🔔', label: 'Notifications', path: null },
    { icon: '🔒', label: 'Privacy & Security', path: null },
    { icon: '❓', label: 'Help and Support', path: null },
    { icon: '📱', label: 'About', path: null },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h1 style={styles.title}>⚙️ Settings</h1>
        <div style={{ width: '40px' }} />
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="🔍 Search settings..."
        />
      </div>

      {/* Dark Mode Toggle */}
      <div style={styles.list}>
        <div style={styles.item}>
          <span style={styles.icon}>{isDark ? '🌙' : '☀️'}</span>
          <span style={styles.label}>Dark Mode</span>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isDark}
              onChange={toggleTheme}
              style={{ display: 'none' }}
            />
            <span style={{
              width: '44px',
              height: '24px',
              backgroundColor: isDark ? 'var(--color-primary)' : 'var(--icon-muted)',
              borderRadius: '12px',
              position: 'relative',
              display: 'inline-block',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isDark ? '22px' : '2px',
                transition: 'left 0.2s',
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* Settings List */}
      <div style={styles.list}>
        {settingsItems.map((item, index) => (
          <div
            key={index}
            style={styles.item}
            onClick={() => item.path && navigate(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
            <span style={styles.arrow}>›</span>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div style={styles.logoutSection}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: '80px' }} />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg-page)',
    minHeight: '100vh',
    paddingBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-page)',
    borderBottom: '1px solid var(--border-default)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    color: 'var(--color-primary)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--color-primary)',
  },
  searchContainer: {
    padding: '16px 20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-default)',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  list: {
    padding: '0 20px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  icon: {
    fontSize: '24px',
    marginRight: '16px',
  },
  label: {
    flex: 1,
    fontSize: '16px',
    color: 'var(--color-primary)',
    fontWeight: '500',
  },
  arrow: {
    fontSize: '20px',
    color: 'var(--text-disabled)',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  logoutSection: {
    padding: '24px 20px',
  },
  logoutBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'var(--bg-card)',
    color: '#cc0000',
    border: '1px solid #cc0000',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default SettingsScreen;
