import React from 'react';
import BottomNav from '../components/BottomNav';

const ProfileScreen = () => {
  const photos = [
    { id: 1, src: '/snaplet-pjatk-project/figma/images/rectangle-61-268.png' },
    { id: 2, src: '/snaplet-pjatk-project/figma/images/rectangle-62-269.png' },
    { id: 3, src: '/snaplet-pjatk-project/figma/images/rectangle-63-270.png' },
    { id: 4, src: '/snaplet-pjatk-project/figma/images/rectangle-64-271.png' },
    { id: 5, src: '/snaplet-pjatk-project/figma/images/rectangle-65-272.png' },
    { id: 6, src: '/snaplet-pjatk-project/figma/images/rectangle-66-273.png' },
  ];

  const timeline = [
    {
      month: 'January 2026',
      photos: photos.slice(0, 3),
    },
    {
      month: 'December 2025',
      photos: [
        { id: 7, src: '/snaplet-pjatk-project/figma/images/rectangle-88-284.png' },
        { id: 8, src: '/snaplet-pjatk-project/figma/images/rectangle-89-285.png' },
      ],
    },
    {
      month: 'November 2025',
      photos: [],
    },
  ];

  return (
    <div className="screen profile-screen">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
      </div>

      {/* User Section */}
      <div className="profile-user-section">
        <div className="profile-avatar">
          <img src="/snaplet-pjatk-project/figma/images/rectangle-57-265.png" alt="Profile" />
        </div>
        <h2 className="profile-username">Krzysztof</h2>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">6</span>
            <span className="stat-label">Snaplets</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">3</span>
            <span className="stat-label">Friends</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">625</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="profile-photos-section">
        <h3 className="profile-section-title">Recent Snaplets</h3>
        <div className="profile-photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="profile-photo-item">
              <img src={photo.src} alt={`Snaplet ${photo.id}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="profile-timeline">
        {timeline.map((section, index) => (
          <div key={index} className="timeline-month">
            <h4 className="timeline-month-title">{section.month}</h4>
            {section.photos.length > 0 && (
              <div className="timeline-photos">
                {section.photos.map((photo) => (
                  <div key={photo.id} className="profile-photo-item">
                    <img src={photo.src} alt={`Snaplet ${photo.id}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav active="profile" />
    </div>
  );
};

export default ProfileScreen;
