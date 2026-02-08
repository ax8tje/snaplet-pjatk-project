import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFeedStore } from '../store/feedStore';
import { useUserStore } from '../store/userStore';
import { getUserProfile } from '../services/userService';
import { likePost, unlikePost, isPostLikedByUser } from '../services/likeService';

// Component to handle media display with fallback from image to video
const PostMedia = ({ post }) => {
  const [isVideo, setIsVideo] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mediaUrl = post.thumbnailUrl || post.imageUrl;

  // Check if URL suggests it's a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  };

  // If URL has video extension, show as video immediately
  const showAsVideo = isVideo || isVideoUrl(post.imageUrl) || isVideoUrl(post.videoUrl);

  const videoRef = useRef(null);

  // IntersectionObserver for mobile autoplay
  useEffect(() => {
    if (!showAsVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [showAsVideo]);

  if (loadError && !isVideo) {
    // Image failed to load, show error
    return (
      <div style={{
        width: '100%',
        aspectRatio: '1',
        backgroundColor: 'var(--bg-media)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-disabled)'
      }}>
        Media failed to load
      </div>
    );
  }

  if (showAsVideo) {
    return (
      <div style={{
        width: '100%',
        aspectRatio: '1',
        backgroundColor: '#000',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          src={post.videoUrl || post.imageUrl}
          poster={post.thumbnailUrl !== post.imageUrl ? post.thumbnailUrl : undefined}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          muted
          loop
          playsInline
          onMouseEnter={(e) => e.target.play().catch(() => {})}
          onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
          onError={() => setLoadError(true)}
        />
        {/* Video indicator */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '4px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          <span style={{ color: '#fff', fontSize: '10px' }}>Video</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      aspectRatio: '1',
      backgroundColor: 'var(--bg-media)',
      position: 'relative'
    }}>
      <img
        src={mediaUrl}
        alt="Post"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        loading="lazy"
        onError={(e) => {
          console.log('[PostMedia] Image failed, trying as video:', post.id);
          // Image failed - might be a video with wrong extension
          setIsVideo(true);
        }}
      />
    </div>
  );
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const { posts, isLoading, error, hasMore, fetchFeed, fetchMorePosts, subscribeToFeed, clearError } = useFeedStore();
  const { user, isAuthenticated } = useUserStore();
  const [userProfiles, setUserProfiles] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({}); // { postId: boolean }
  const [likingPosts, setLikingPosts] = useState({}); // { postId: boolean } - loading state
  const [localLikeCounts, setLocalLikeCounts] = useState({}); // { postId: number } - optimistic counts

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

  const location = useLocation();
  const unsubscribeRef = useRef(null);
  const lastLocationKeyRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('[HomeScreen] Posts changed:', posts.length, 'isLoading:', isLoading);
  }, [posts, isLoading]);

  // Fetch fresh data when entering/returning to the screen
  useEffect(() => {
    console.log('[HomeScreen] Location effect - key:', location.key, 'lastKey:', lastLocationKeyRef.current, 'isAuth:', isAuthenticated);
    if (isAuthenticated && location.key !== lastLocationKeyRef.current) {
      lastLocationKeyRef.current = location.key;
      console.log('[HomeScreen] Calling fetchFeed()');
      fetchFeed();
    }
  }, [isAuthenticated, location.key, fetchFeed]);

  // Manage subscription separately - only once per auth session
  useEffect(() => {
    console.log('[HomeScreen] Subscription effect - isAuth:', isAuthenticated, 'hasUnsub:', !!unsubscribeRef.current);
    if (!isAuthenticated) {
      if (unsubscribeRef.current) {
        console.log('[HomeScreen] Cleaning up subscription (logged out)');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    if (!unsubscribeRef.current) {
      console.log('[HomeScreen] Setting up subscription');
      unsubscribeRef.current = subscribeToFeed(20);
    }

    return () => {
      console.log('[HomeScreen] Cleanup - unmounting');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, subscribeToFeed]);

  // Fetch user profiles when posts change
  useEffect(() => {
    if (posts.length > 0) {
      fetchUserProfiles(posts);
    }
  }, [posts]);

  // Check which posts are liked by current user
  useEffect(() => {
    if (!user?.uid || posts.length === 0) return;

    const checkLikedPosts = async () => {
      const likedStatus = { ...likedPosts };
      for (const post of posts) {
        if (likedStatus[post.id] === undefined) {
          try {
            const isLiked = await isPostLikedByUser(post.id, user.uid);
            likedStatus[post.id] = isLiked;
          } catch (err) {
            console.error('Error checking like status:', err);
          }
        }
      }
      setLikedPosts(likedStatus);
    };

    checkLikedPosts();
  }, [posts, user?.uid]);

  // Handle like toggle for a post
  const handleLikeToggle = async (postId, currentLikes, e) => {
    e.stopPropagation(); // Prevent navigating to post detail
    if (!user?.uid || likingPosts[postId]) return;

    const wasLiked = likedPosts[postId];
    const currentCount = localLikeCounts[postId] ?? currentLikes;

    // Set loading state
    setLikingPosts(prev => ({ ...prev, [postId]: true }));

    // Optimistic update
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    setLocalLikeCounts(prev => ({
      ...prev,
      [postId]: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1
    }));

    try {
      if (wasLiked) {
        await unlikePost(postId, user.uid);
      } else {
        await likePost(postId, user.uid);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
      // Revert on error
      setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
      setLocalLikeCounts(prev => ({ ...prev, [postId]: currentCount }));
    } finally {
      setLikingPosts(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Navigate to post comments
  const handleCommentClick = (postId, e) => {
    e.stopPropagation();
    navigate(`/post/${postId}`);
  };

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

  // Navigate to user profile
  const handleUserClick = (userId, e) => {
    e.stopPropagation(); // Prevent triggering post click
    navigate(`/user/${userId}`);
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
    <div style={screenStyles.container} onScroll={handleScroll}>
      {/* Header */}
      <div style={screenStyles.header}>
        <h1 style={screenStyles.title}>Snaplet</h1>
        <button style={screenStyles.settingsBtn} onClick={() => navigate('/settings')}>
          ⚙️
        </button>
      </div>

      {/* Pull to refresh button */}
      <div style={{ padding: '10px', textAlign: 'center' }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-accent)',
            border: '1px solid var(--color-primary)',
            borderRadius: '20px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh Feed'}
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
            border: '3px solid var(--spinner-track)',
            borderTop: '3px solid var(--color-primary)',
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
          color: 'var(--text-secondary)'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--text-disabled)" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="var(--text-disabled)"/>
            <path d="M21 15l-5-5L5 21" stroke="var(--text-disabled)" strokeWidth="2"/>
          </svg>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No posts yet</p>
          <p style={{ fontSize: '14px' }}>Be the first to share a Snaplet!</p>
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
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px var(--shadow-card)',
                  cursor: 'pointer'
                }}
              >
                {/* Post Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid var(--border-post)',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleUserClick(post.userId, e)}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-placeholder)',
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
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-accent)',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {(profile.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: 'var(--color-primary)' }}>
                      {profile.displayName || 'Unknown User'}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Media (Image or Video) */}
                <PostMedia post={post} />

                {/* Post Footer */}
                <div style={{ padding: '12px' }}>
                  {/* Action buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: post.caption ? '8px' : 0
                  }}>
                    {/* Like button */}
                    <button
                      onClick={(e) => handleLikeToggle(post.id, post.likes || 0, e)}
                      disabled={!user || likingPosts[post.id]}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: (user && !likingPosts[post.id]) ? 'pointer' : 'not-allowed',
                        padding: '4px',
                        opacity: (user && !likingPosts[post.id]) ? 1 : 0.5
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={likedPosts[post.id] ? '#e74c3c' : 'none'}>
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          stroke={likedPosts[post.id] ? '#e74c3c' : 'var(--text-secondary)'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {localLikeCounts[post.id] ?? (post.likes || 0)}
                      </span>
                    </button>

                    {/* Comment button */}
                    <button
                      onClick={(e) => handleCommentClick(post.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                          stroke="var(--text-secondary)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {post.commentCount || 0}
                      </span>
                    </button>
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
              color: 'var(--text-muted)'
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
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-accent)',
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

      {/* Spacer for bottom nav */}
      <div style={{ height: '80px' }} />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const screenStyles = {
  container: {
    backgroundColor: 'var(--bg-page)',
    minHeight: '100vh',
    overflowY: 'auto',
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
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: 'var(--color-primary)',
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
  },
};

export default HomeScreen;
