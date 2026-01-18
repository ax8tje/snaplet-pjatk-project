import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomNav = ({ active }) => {
  const navigate = useNavigate();

  return (
    <div className="frame-6-54" style={{position: 'absolute', bottom: 0}}>
      <div className="user-user-01" onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>
        <img src="/snaplet-pjatk-project/figma/images/vector-56.svg" className="vector-56" alt="profile" />
      </div>
      <div className="user-users" onClick={() => navigate('/messages')} style={{cursor: 'pointer'}}>
        <img src="/snaplet-pjatk-project/figma/images/vector-58.svg" className="vector-58" alt="messages" />
      </div>
      <img
        src="/snaplet-pjatk-project/figma/images/rectangle-59.png"
        className="rectangle-59"
        alt="home"
        onClick={() => navigate('/home')}
        style={{cursor: 'pointer'}}
      />
      <div className="node-60" onClick={() => navigate('/settings')} style={{cursor: 'pointer'}}>
        <img src="/snaplet-pjatk-project/figma/images/vector-61.svg" className="vector-61" alt="settings" />
      </div>
      <div className="calendar-logo-62">
        <div className="rectangle-97-63"></div>
        <div className="rectangle-100-64"></div>
        <div className="rectangle-99-65"></div>
        <div className="rectangle-98-66"></div>
      </div>
    </div>
  );
};

export default BottomNav;
