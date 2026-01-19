import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const HomeScreen = () => {
  const navigate = useNavigate();

  const photos = [
    '/snaplet-pjatk-project/figma/images/rectangle-61-67.png',
    '/snaplet-pjatk-project/figma/images/rectangle-62-68.png',
    '/snaplet-pjatk-project/figma/images/rectangle-63-69.png',
    '/snaplet-pjatk-project/figma/images/rectangle-64-70.png',
    '/snaplet-pjatk-project/figma/images/rectangle-65-71.png',
    '/snaplet-pjatk-project/figma/images/rectangle-66-72.png',
  ];

  const timers = [
    { id: 1, time: '36:32:12' },
    { id: 2, time: '60:32:12' },
    { id: 3, time: '12:32:12' },
  ];

  return (
    <div className="screen home-screen">
      {/* Header with settings */}
      <div className="home-header">
        <button className="settings-btn" onClick={() => navigate('/settings')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#3A2B20" strokeWidth="2"/>
            <path d="M12 5V3M12 21V19M19 12H21M3 12H5M17.6 17.6L19 19M5 5L6.4 6.4M6.4 17.6L5 19M19 5L17.6 6.4" stroke="#3A2B20" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* Photo Grid */}
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div key={index} className="grid-item photo-item">
            <img src={photo} alt={`Photo ${index + 1}`} />
          </div>
        ))}

        {/* Empty placeholders */}
        {[...Array(10)].map((_, index) => (
          <div key={`empty-${index}`} className="grid-item empty-item"></div>
        ))}

        {/* Add button */}
        <div className="grid-item add-item" onClick={() => navigate('/camera')}>
          <div className="add-icon">+</div>
        </div>

        {/* Timer items */}
        {timers.map((timer) => (
          <div key={timer.id} className="grid-item timer-item">
            <div className="timer-spinner"></div>
            <span className="timer-text">{timer.time}</span>
          </div>
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );
};

export default HomeScreen;
