import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useFeedStore } from '../store/feedStore';
import { uploadPhoto } from '../services/storageService';
import { getUserProfile } from '../services/userService';
import { getFriendshipStatus, sendFriendRequest, removeFriend, cancelFriendRequest, acceptFriendRequest } from '../services/friendService';
import { getClipsByMonth, getUserClipDates } from '../services/clipService';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams(); // Get userId from URL params if viewing other user
  const { user, profile: currentUserProfile, isAuthenticated, isLoading: userLoading, logout, updateProfile, fetchProfile, error, clearError } = useUserStore();
  const { userPosts, isLoading: postsLoading, fetchUserPosts } = useFeedStore();

  // Determine if viewing own profile or another user's
  const isOwnProfile = !paramUserId || paramUserId === user?.uid;
  const viewingUserId = paramUserId || user?.uid;

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [loadingOtherProfile, setLoadingOtherProfile] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'snaplets'

  // Friend state
  const [friendStatus, setFriendStatus] = useState('none'); // 'none', 'friends', 'pending_sent', 'pending_received'
  const [friendLoading, setFriendLoading] = useState(false);

  // Snaplets (clips) state
  const [userClips, setUserClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(false);

  // Profile to display (own or other user's)
  const profile = isOwnProfile ? currentUserProfile : otherUserProfile;

  // Fetch user data on mount
  useEffect(() => {
    if (isOwnProfile && user?.uid) {
      fetchProfile(user.uid);
      fetchUserPosts(user.uid);
    } else if (!isOwnProfile && paramUserId) {
      // Fetch other user's profile
      setLoadingOtherProfile(true);
      getUserProfile(paramUserId)
        .then(setOtherUserProfile)
        .catch(() => setOtherUserProfile(null))
        .finally(() => setLoadingOtherProfile(false));
      fetchUserPosts(paramUserId);
    }
  }, [user?.uid, paramUserId, isOwnProfile]);

  // Fetch friend status for other user's profile
  useEffect(() => {
    if (!isOwnProfile && user?.uid && paramUserId) {
      getFriendshipStatus(user.uid, paramUserId)
        .then(setFriendStatus)
        .catch(() => setFriendStatus('none'));
    }
  }, [isOwnProfile, user?.uid, paramUserId]);

  // Fetch user clips (snaplets)
  useEffect(() => {
    const fetchClips = async () => {
      if (!viewingUserId) return;
      setClipsLoading(true);
      try {
        // Get all clip dates for this user, then fetch clips
        const clipDates = await getUserClipDates(viewingUserId);
        if (clipDates.length > 0) {
          // Get unique months
          const months = [...new Set(clipDates.map(date => date.slice(0, 7)))];
          let allClips = [];
          for (const month of months) {
            const monthClips = await getClipsByMonth(viewingUserId, month);
            allClips = [...allClips, ...monthClips];
          }
          // Sort by date descending
          allClips.sort((a, b) => b.date.localeCompare(a.date));
          setUserClips(allClips);
        }
      } catch (err) {
        console.error('Error fetching clips:', err);
      } finally {
        setClipsLoading(false);
      }
    };

    fetchClips();
  }, [viewingUserId]);

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

  // Handle friend actions
  const handleAddFriend = async () => {
    if (!user?.uid || !paramUserId || friendLoading) return;
    setFriendLoading(true);
    try {
      const result = await sendFriendRequest(user.uid, paramUserId);
      setFriendStatus(result.status === 'accepted' ? 'friends' : 'pending_sent');
    } catch (err) {
      console.error('Add friend error:', err);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!user?.uid || !paramUserId || friendLoading) return;
    setFriendLoading(true);
    try {
      await removeFriend(user.uid, paramUserId);
      setFriendStatus('none');
    } catch (err) {
      console.error('Remove friend error:', err);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user?.uid || !paramUserId || friendLoading) return;
    setFriendLoading(true);
    try {
      await cancelFriendRequest(user.uid, paramUserId);
      setFriendStatus('none');
    } catch (err) {
      console.error('Cancel request error:', err);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!user?.uid || !paramUserId || friendLoading) return;
    setFriendLoading(true);
    try {
      const requestId = `${paramUserId}_${user.uid}`;
      await acceptFriendRequest(requestId, user.uid, paramUserId);
      setFriendStatus('friends');
    } catch (err) {
      console.error('Accept request error:', err);
    } finally {
      setFriendLoading(false);
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
        const uploadTask = uploadPhoto(file, user.uid, 'profile', null, {
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
          <p style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Please log in to view your profile
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-accent)',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading other user's profile
  if (loadingOtherProfile) {
    return (
      <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--spinner-track)',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Other user not found
  if (!isOwnProfile && !otherUserProfile) {
    return (
      <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-secondary)' }}>User not found</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-accent)',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const groupedPosts = groupPostsByMonth(userPosts);

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', overflowY: 'auto', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {!isOwnProfile ? (
          <>
            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                marginRight: '8px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)', flex: 1 }}>
              {profile?.displayName || 'User'}
            </h1>
          </>
        ) : (
          <>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>👤 Profile</h1>
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
          </>
        )}
      </div>

      {/* Error display */}
      {(error || uploadError) && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
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
        borderBottom: '1px solid var(--border-light)'
      }}>
        {/* Avatar */}
        <div
          className="profile-avatar"
          onClick={isOwnProfile ? handlePhotoUpload : undefined}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-placeholder)',
            cursor: isOwnProfile ? 'pointer' : 'default',
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
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-accent)',
              fontSize: '40px',
              fontWeight: '600'
            }}>
              {(profile?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* Upload overlay */}
          {isOwnProfile && isUploading && (
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

          {/* Edit icon - only for own profile */}
          {isOwnProfile && !isUploading && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="var(--color-accent)" strokeWidth="2"/>
                <circle cx="12" cy="13" r="4" stroke="var(--color-accent)" strokeWidth="2"/>
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
              fontWeight: '600',
              color: 'var(--color-primary)'
            }}>
              {profile?.displayName || 'Unknown User'}
            </h2>

            {profile?.bio && (
              <p style={{
                margin: '0 0 12px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                maxWidth: '280px'
              }}>
                {profile.bio}
              </p>
            )}

            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              {isOwnProfile ? (profile?.email || user?.email) : ''}
            </p>

            {isOwnProfile ? (
              <button
                onClick={handleStartEdit}
                style={{
                  padding: '8px 24px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Edit Profile
              </button>
            ) : (
              /* Friend action buttons for other users */
              <div style={{ display: 'flex', gap: '12px' }}>
                {friendStatus === 'none' && (
                  <button
                    onClick={handleAddFriend}
                    disabled={friendLoading}
                    style={{
                      padding: '8px 24px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-accent)',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: friendLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: friendLoading ? 0.7 : 1
                    }}
                  >
                    {friendLoading ? 'Loading...' : 'Add Friend'}
                  </button>
                )}
                {friendStatus === 'pending_sent' && (
                  <button
                    onClick={handleCancelRequest}
                    disabled={friendLoading}
                    style={{
                      padding: '8px 24px',
                      backgroundColor: '#888',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: friendLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: friendLoading ? 0.7 : 1
                    }}
                  >
                    {friendLoading ? 'Loading...' : 'Cancel Request'}
                  </button>
                )}
                {friendStatus === 'pending_received' && (
                  <>
                    <button
                      onClick={handleAcceptRequest}
                      disabled={friendLoading}
                      style={{
                        padding: '8px 24px',
                        backgroundColor: '#27ae60',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: friendLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: friendLoading ? 0.7 : 1
                      }}
                    >
                      {friendLoading ? '...' : 'Accept'}
                    </button>
                    <button
                      onClick={handleCancelRequest}
                      disabled={friendLoading}
                      style={{
                        padding: '8px 24px',
                        backgroundColor: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: friendLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: friendLoading ? 0.7 : 1
                      }}
                    >
                      {friendLoading ? '...' : 'Decline'}
                    </button>
                  </>
                )}
                {friendStatus === 'friends' && (
                  <button
                    onClick={handleRemoveFriend}
                    disabled={friendLoading}
                    style={{
                      padding: '8px 24px',
                      backgroundColor: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: friendLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: friendLoading ? 0.7 : 1
                    }}
                  >
                    {friendLoading ? 'Loading...' : 'Remove Friend'}
                  </button>
                )}
              </div>
            )}
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
                border: '1px solid var(--border-input)',
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
                border: '1px solid var(--border-input)',
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
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-input)',
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
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-accent)',
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
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '600', display: 'block', color: 'var(--color-primary)' }}>
              {userPosts.length}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Posts
            </span>
          </div>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '600', display: 'block', color: 'var(--color-primary)' }}>
              {userClips.length}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Snaplets
            </span>
          </div>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '600', display: 'block', color: 'var(--color-primary)' }}>
              {profile?.friendCount || 0}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Friends
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'posts' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'posts' ? 'var(--color-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'posts' ? '600' : '400'
          }}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('snaplets')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'snaplets' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'snaplets' ? 'var(--color-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'snaplets' ? '600' : '400'
          }}
        >
          Snaplets
        </button>
      </div>

      {/* Loading state */}
      {activeTab === 'posts' && postsLoading && userPosts.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--spinner-track)',
            borderTop: '2px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading posts...</p>
        </div>
      )}

      {/* POSTS TAB CONTENT */}
      {activeTab === 'posts' && (
        <>
          {/* Empty posts state */}
          {!postsLoading && userPosts.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '12px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--text-disabled)" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="var(--text-disabled)"/>
                <path d="M21 15l-5-5L5 21" stroke="var(--text-disabled)" strokeWidth="2"/>
              </svg>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No posts yet</p>
              <p style={{ fontSize: '14px' }}>Stwórz swój pierwszy post!</p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/camera')}
                  style={{
                    marginTop: '16px',
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-accent)',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Create Post
                </button>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {userPosts.length > 0 && (
            <div className="profile-timeline" style={{ padding: '16px' }}>
              {groupedPosts.map((group, groupIndex) => (
                <div key={groupIndex} className="timeline-month" style={{ marginBottom: '24px' }}>
                  <h4 className="timeline-month-title" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
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
                          backgroundColor: 'var(--bg-media)',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        <img
                          src={post.thumbnailUrl || post.imageUrl}
                          alt="Post"
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
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          <span>{post.likes || 0}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"/>
                          </svg>
                          <span>{post.commentCount || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* SNAPLETS TAB CONTENT */}
      {activeTab === 'snaplets' && (
        <>
          {/* Loading snaplets */}
          {clipsLoading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="loading-spinner" style={{
                width: '32px',
                height: '32px',
                border: '2px solid var(--spinner-track)',
                borderTop: '2px solid var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading snaplets...</p>
            </div>
          )}

          {/* Empty snaplets state */}
          {!clipsLoading && userClips.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '12px' }}>
                <polygon points="5,3 19,12 5,21" stroke="var(--text-disabled)" strokeWidth="2" fill="none"/>
              </svg>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No snaplets yet</p>
              <p style={{ fontSize: '14px' }}>Daily video clips will appear here</p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/calendar')}
                  style={{
                    marginTop: '16px',
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-accent)',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Record Snaplet
                </button>
              )}
            </div>
          )}

          {/* Snaplets Grid */}
          {!clipsLoading && userClips.length > 0 && (
            <div style={{ padding: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px'
              }}>
                {userClips.map((clip) => (
                  <div
                    key={clip.id || clip.date}
                    style={{
                      aspectRatio: '1',
                      overflow: 'hidden',
                      backgroundColor: '#000',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {clip.thumbnailUrl ? (
                      <img
                        src={clip.thumbnailUrl}
                        alt={`Snaplet ${clip.date}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={clip.videoUrl}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        muted
                        playsInline
                        onMouseEnter={(e) => e.target.play().catch(() => {})}
                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                    )}
                    {/* Date label */}
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      {clip.date}
                    </div>
                    {/* Video indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Member since */}
      {profile?.createdAt && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px',
          borderTop: '1px solid var(--border-light)'
        }}>
          Member since {formatDate(profile.createdAt)}
        </div>
      )}

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
