import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useFeedStore } from '../store/feedStore';
import { useUserStore } from '../store/userStore';
import { getUserProfile } from '../services/userService';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { posts, isLoading, error, hasMore, fetchFeed, fetchMorePosts, subscribeToFeed, clearError } = useFeedStore();
  const { user, isAuthenticated } = useUserStore();
  const [userProfiles, setUserProfiles] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profiles for posts
  const fetchUserProfiles = useCallback(async (postsData) => {
    const uniqueUserIds = [...new Set(postsData.map(post => post.userId))];
    const profiles = { ...userProfiles };

    for (const userId of uniqueUserIds) {
      if (!profiles[userId]) {
        try {
          const profile = await getUserProfile(userId);
          profiles[userId] = profile;
        } catch (err) {
          profiles[userId] = { displayName: 'Unknown User', photoURL: '' };
        }
      }
    }

    setUserProfiles(profiles);
  }, [userProfiles]);

  // Initial load and subscription
  useEffect(() => {
    fetchFeed();
    const unsubscribe = subscribeToFeed(20);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch user profiles when posts change
  useEffect(() => {
    if (posts.length > 0) {
      fetchUserProfiles(posts);
    }
  }, [posts]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    clearError();
    await fetchFeed();
    setRefreshing(false);
  };

  // Infinite scroll
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchMorePosts();
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      handleLoadMore();
    }
  };

  // Navigate to post detail
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Format time ago
  const formatTimeAgo = (createdAt) => {
    if (!createdAt) return '';

    const date = createdAt instanceof Date
      ? createdAt
      : createdAt.seconds
        ? new Date(createdAt.seconds * 1000)
        : new Date(createdAt);

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  return (
    <div className="screen home-screen" onScroll={handleScroll} style={{ overflowY: 'auto', height: '100vh' }}>
      {/* Header with settings */}
      <div className="home-header">
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Snaplet</h1>
        <button className="settings-btn" onClick={() => navigate('/settings')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#3A2B20" strokeWidth="2"/>
            <path d="M12 5V3M12 21V19M19 12H21M3 12H5M17.6 17.6L19 19M5 5L6.4 6.4M6.4 17.6L5 19M19 5L17.6 6.4" stroke="#3A2B20" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* Pull to refresh button */}
      <div style={{ padding: '10px', textAlign: 'center' }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FDF5DD',
            border: '1px solid #3A2B20',
            borderRadius: '20px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#cc0000',
          backgroundColor: '#ffe6e6',
          margin: '10px',
          borderRadius: '8px'
        }}>
          <p>{error}</p>
          <button
            onClick={() => { clearError(); fetchFeed(); }}
            style={{ marginTop: '10px', padding: '8px 16px' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && posts.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3A2B20',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading feed...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && !error && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#999" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="#999"/>
            <path d="M21 15l-5-5L5 21" stroke="#999" strokeWidth="2"/>
          </svg>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No posts yet</p>
          <p style={{ fontSize: '14px' }}>Be the first to share a Snaplet!</p>
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
            Create Post
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length > 0 && (
        <div className="feed-container" style={{ padding: '10px' }}>
          {posts.map((post) => {
            const profile = userProfiles[post.userId] || {};
            return (
              <div
                key={post.id}
                className="post-card"
                onClick={() => handlePostClick(post.id)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                {/* Post Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    overflow: 'hidden',
                    marginRight: '12px'
                  }}>
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={profile.displayName}
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
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {(profile.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
                      {profile.displayName || 'Unknown User'}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                      {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Image */}
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#f0f0f0'
                }}>
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
                </div>

                {/* Post Footer */}
                <div style={{ padding: '12px' }}>
                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: post.caption ? '8px' : 0
                  }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      ❤️ {post.likes || 0}
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      💬 {post.commentCount || 0}
                    </span>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      <span style={{ fontWeight: '600' }}>
                        {profile.displayName || 'Unknown'}
                      </span>{' '}
                      {post.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Load more indicator */}
          {isLoading && posts.length > 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Loading more...</p>
            </div>
          )}

          {/* End of feed */}
          {!hasMore && posts.length > 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#888'
            }}>
              <p>You've seen all posts!</p>
            </div>
          )}
        </div>
      )}

      {/* Add button - floating */}
      <div
        onClick={() => navigate('/camera')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#3A2B20',
          color: '#FDF5DD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 100
        }}
      >
        +
      </div>

      <BottomNav active="home" />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
