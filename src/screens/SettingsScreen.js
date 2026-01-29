import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useUserStore } from '../store/userStore';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const settingsItems = [
    { icon: '👤', label: 'Account', path: '/profile' },
    { icon: '🔔', label: 'Notifications', path: null },
    { icon: '🎨', label: 'Appearance', path: null },
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

      <BottomNav active="settings" />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#F5E6D3',
    minHeight: '100vh',
    paddingBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#F5E6D3',
    borderBottom: '1px solid #E0D5C7',
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
    color: '#3A2B20',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#3A2B20',
  },
  searchContainer: {
    padding: '16px 20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #E0D5C7',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#3A2B20',
    fontWeight: '500',
  },
  arrow: {
    fontSize: '20px',
    color: '#999',
  },
  logoutSection: {
    padding: '24px 20px',
  },
  logoutBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#FFFFFF',
    color: '#cc0000',
    border: '1px solid #cc0000',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default SettingsScreen;
