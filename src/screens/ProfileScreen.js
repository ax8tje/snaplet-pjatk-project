import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useUserStore } from '../store/userStore';
import { useFeedStore } from '../store/feedStore';
import { uploadPhoto } from '../services/storageService';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading: userLoading, logout, updateProfile, fetchProfile, error, clearError } = useUserStore();
  const { userPosts, isLoading: postsLoading, fetchUserPosts } = useFeedStore();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    if (user?.uid) {
      fetchProfile(user.uid);
      fetchUserPosts(user.uid);
    }
  }, [user?.uid]);

  // Set edit values when profile loads
  useEffect(() => {
    if (profile) {
      setEditName(profile.displayName || '');
      setEditBio(profile.bio || '');
    }
  }, [profile]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle edit profile
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(profile?.displayName || '');
    setEditBio(profile?.bio || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(profile?.displayName || '');
    setEditBio(profile?.bio || '');
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        displayName: editName.trim(),
        bio: editBio.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !user?.uid) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        const uploadTask = uploadPhoto(file, user.uid, 'avatars', null, {
          compress: true,
          generateThumb: false,
        });

        const result = await uploadTask.promise;

        await updateProfile({
          photoURL: result.downloadURL,
        });
      } catch (err) {
        console.error('Photo upload error:', err);
        setUploadError('Failed to upload photo. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  // Navigate to post detail
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group posts by month
  const groupPostsByMonth = (posts) => {
    const groups = {};
    posts.forEach((post) => {
      const date = post.createdAt instanceof Date
        ? post.createdAt
        : post.createdAt?.seconds
          ? new Date(post.createdAt.seconds * 1000)
          : new Date(post.createdAt);

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!groups[key]) {
        groups[key] = { label, posts: [] };
      }
      groups[key].posts.push(post);
    });

    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.posts[0].createdAt?.seconds * 1000 || a.posts[0].createdAt);
      const dateB = new Date(b.posts[0].createdAt?.seconds * 1000 || b.posts[0].createdAt);
      return dateB - dateA;
    });
  };

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="screen profile-screen">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '20px', color: '#666' }}>
            Please log in to view your profile
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3A2B20',
              color: '#FDF5DD',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
        <BottomNav active="profile" />
      </div>
    );
  }

  const groupedPosts = groupPostsByMonth(userPosts);

  return (
    <div className="screen profile-screen" style={{ overflowY: 'auto', height: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="profile-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #eee'
      }}>
        <h1 className="profile-title" style={{ margin: 0, fontSize: '20px' }}>Profile</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#cc0000',
            border: '1px solid #cc0000',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Error display */}
      {(error || uploadError) && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          margin: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error || uploadError}
          <button
            onClick={() => { clearError(); setUploadError(null); }}
            style={{
              marginLeft: '12px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Section */}
      <div className="profile-user-section" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        borderBottom: '1px solid #eee'
      }}>
        {/* Avatar */}
        <div
          className="profile-avatar"
          onClick={handlePhotoUpload}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ddd',
            cursor: 'pointer',
            position: 'relative',
            marginBottom: '16px'
          }}
        >
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#3A2B20',
              color: '#FDF5DD',
              fontSize: '40px',
              fontWeight: '600'
            }}>
              {(profile?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* Upload overlay */}
          {isUploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <div className="loading-spinner" style={{
                width: '24px',
                height: '24px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}

          {/* Edit icon */}
          {!isUploading && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#3A2B20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#FDF5DD" strokeWidth="2"/>
                <circle cx="12" cy="13" r="4" stroke="#FDF5DD" strokeWidth="2"/>
              </svg>
            </div>
          )}
        </div>

        {/* User info - View mode */}
        {!isEditing ? (
          <>
            <h2 className="profile-username" style={{
              margin: '0 0 8px',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              {profile?.displayName || 'Unknown User'}
            </h2>

            {profile?.bio && (
              <p style={{
                margin: '0 0 12px',
                fontSize: '14px',
                color: '#666',
                textAlign: 'center',
                maxWidth: '280px'
              }}>
                {profile.bio}
              </p>
            )}

            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#888' }}>
              {profile?.email || user?.email}
            </p>

            <button
              onClick={handleStartEdit}
              style={{
                padding: '8px 24px',
                backgroundColor: '#FDF5DD',
                color: '#3A2B20',
                border: '1px solid #3A2B20',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Edit Profile
            </button>
          </>
        ) : (
          /* Edit mode */
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Display Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={50}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <textarea
              placeholder="Bio"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={160}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '8px 24px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={userLoading}
                style={{
                  padding: '8px 24px',
                  backgroundColor: '#3A2B20',
                  color: '#FDF5DD',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: userLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: userLoading ? 0.7 : 1
                }}
              >
                {userLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="profile-stats" style={{
          display: 'flex',
          gap: '32px',
          marginTop: '24px'
        }}>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '600', display: 'block' }}>
              {userPosts.length}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>
              Snaplets
            </span>
          </div>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '600', display: 'block' }}>
              {profile?.friendCount || 0}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>
              Friends
            </span>
          </div>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '600', display: 'block' }}>
              {userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>
              Likes
            </span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {postsLoading && userPosts.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: '32px',
            height: '32px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3A2B20',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#888' }}>Loading posts...</p>
        </div>
      )}

      {/* Empty posts state */}
      {!postsLoading && userPosts.length === 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#666'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '12px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#999" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="#999"/>
            <path d="M21 15l-5-5L5 21" stroke="#999" strokeWidth="2"/>
          </svg>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No snaplets yet</p>
          <p style={{ fontSize: '14px' }}>Share your first moment!</p>
          <button
            onClick={() => navigate('/camera')}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              backgroundColor: '#3A2B20',
              color: '#FDF5DD',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create Snaplet
          </button>
        </div>
      )}

      {/* Posts Timeline */}
      {userPosts.length > 0 && (
        <div className="profile-timeline" style={{ padding: '16px' }}>
          {groupedPosts.map((group, groupIndex) => (
            <div key={groupIndex} className="timeline-month" style={{ marginBottom: '24px' }}>
              <h4 className="timeline-month-title" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '12px',
                paddingLeft: '4px'
              }}>
                {group.label}
              </h4>
              <div className="profile-photo-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px'
              }}>
                {group.posts.map((post) => (
                  <div
                    key={post.id}
                    className="profile-photo-item"
                    onClick={() => handlePostClick(post.id)}
                    style={{
                      aspectRatio: '1',
                      overflow: 'hidden',
                      backgroundColor: '#f0f0f0',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={post.thumbnailUrl || post.imageUrl}
                      alt={`Snaplet`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />
                    {/* Hover overlay with stats */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      color: '#fff',
                      fontSize: '14px',
                      opacity: 0,
                      transition: 'all 0.2s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)';
                        e.currentTarget.style.opacity = '0';
                      }}
                    >
                      <span>❤️ {post.likes || 0}</span>
                      <span>💬 {post.commentCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member since */}
      {profile?.createdAt && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#888',
          fontSize: '14px',
          borderTop: '1px solid #eee'
        }}>
          Member since {formatDate(profile.createdAt)}
        </div>
      )}

      <BottomNav active="profile" />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfileScreen;
