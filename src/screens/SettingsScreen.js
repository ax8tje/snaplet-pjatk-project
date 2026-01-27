import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const SettingsScreen = () => {
  const navigate = useNavigate();

  const settingsItems = [
    { icon: '👤', label: 'Account', path: '/settings/account' },
    { icon: '🔔', label: 'Notifications', path: '/settings/notifications' },
    { icon: '👁️', label: 'Appearance', path: '/settings/appearance' },
    { icon: '🔒', label: 'Privacy & Security', path: '/settings/privacy' },
    { icon: '🎧', label: 'Help and Support', path: '/settings/help' },
    { icon: '💡', label: 'About', path: '/settings/about' },
  ];

  return (
    <div className="screen settings-screen">
      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
        <h1 className="settings-title">Settings</h1>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="search for settings"
        />
      </div>

      {/* Settings List */}
      <div className="settings-list">
        {settingsItems.map((item, index) => (
          <div key={index} className="settings-item" onClick={() => navigate(item.path)}>
            <span className="settings-icon">{item.icon}</span>
            <span className="settings-label">{item.label}</span>
            <span className="settings-arrow">›</span>
          </div>
        ))}
      </div>

      <BottomNav active="settings" />
    </div>
  );
};

export default SettingsScreen;
