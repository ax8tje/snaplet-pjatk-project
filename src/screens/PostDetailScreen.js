import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useFeedStore } from '../store/feedStore';
import { useUserStore } from '../store/userStore';
import { getPost, subscribeToPost } from '../services/postService';
import { getPostComments, createComment, deleteComment, subscribeToPostComments } from '../services/commentService';
import { likePost, unlikePost, isPostLikedByUser, subscribeToPostLikes } from '../services/likeService';
import { getUserProfile } from '../services/userService';

const PostDetailScreen = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user, isAuthenticated } = useUserStore();

  // State
  const [post, setPost] = useState(null);
  const [postAuthor, setPostAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentAuthors, setCommentAuthors] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('for-you');

  // Fetch post data
  useEffect(() => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    // Subscribe to post updates
    const unsubscribePost = subscribeToPost(postId, (updatedPost) => {
      if (updatedPost instanceof Error) {
        setError(updatedPost.message);
        setIsLoading(false);
        return;
      }

      if (updatedPost) {
        setPost(updatedPost);
        setLikeCount(updatedPost.likes || 0);

        // Fetch author info
        getUserProfile(updatedPost.userId)
          .then(setPostAuthor)
          .catch(() => setPostAuthor({ displayName: 'Unknown User', photoURL: '' }));
      }
      setIsLoading(false);
    });

    // Subscribe to comments
    const unsubscribeComments = subscribeToPostComments(postId, (updatedComments) => {
      if (updatedComments instanceof Error) {
        console.error('Comments error:', updatedComments);
        return;
      }
      setComments(updatedComments);

      // Fetch comment authors
      const uniqueUserIds = [...new Set(updatedComments.map(c => c.userId))];
      uniqueUserIds.forEach(async (userId) => {
        if (!commentAuthors[userId]) {
          try {
            const profile = await getUserProfile(userId);
            setCommentAuthors(prev => ({ ...prev, [userId]: profile }));
          } catch {
            setCommentAuthors(prev => ({ ...prev, [userId]: { displayName: 'Unknown', photoURL: '' } }));
          }
        }
      });
    });

    return () => {
      unsubscribePost();
      unsubscribeComments();
    };
  }, [postId]);

  // Check if user liked the post
  useEffect(() => {
    if (!postId || !user?.uid) return;

    isPostLikedByUser(postId, user.uid)
      .then(setIsLiked)
      .catch(console.error);
  }, [postId, user?.uid]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!user?.uid || !postId) return;

    try {
      if (isLiked) {
        await unlikePost(postId, user.uid);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likePost(postId, user.uid);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user?.uid || !postId) return;

    setIsSubmitting(true);
    try {
      await createComment(postId, user.uid, newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Add comment error:', err);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!postId) return;

    try {
      await deleteComment(commentId, postId);
    } catch (err) {
      console.error('Delete comment error:', err);
      setError('Failed to delete comment');
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp instanceof Date
      ? timestamp
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}d`;
    if (diffHour > 0) return `${diffHour}h`;
    if (diffMin > 0) return `${diffMin}m`;
    return 'now';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="screen post-detail-screen" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3A2B20',
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

  // Post not found
  if (!post) {
    return (
      <div className="screen post-detail-screen" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', color: '#666' }}>
          Post not found
        </p>
        <button
          onClick={() => navigate('/home')}
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
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="screen post-detail-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #eee'
      }}>
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
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Author info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#ddd',
            marginRight: '12px'
          }}>
            {postAuthor?.photoURL ? (
              <img
                src={postAuthor.photoURL}
                alt={postAuthor.displayName}
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
                {(postAuthor?.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
              {postAuthor?.displayName || 'Unknown User'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              {formatTime(post.createdAt)} ago
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eee'
      }}>
        {['friends', 'for-you'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: activeTab === tab ? '#3A2B20' : 'transparent',
              color: activeTab === tab ? '#FDF5DD' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '600' : '400',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'for-you' ? 'For you' : 'Friends'}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Post Image */}
        <div style={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: '#f0f0f0'
        }}>
          <img
            src={post.imageUrl}
            alt="Post"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          padding: '12px 16px',
          gap: '20px',
          borderBottom: '1px solid #eee'
        }}>
          {/* Like button */}
          <button
            onClick={handleLikeToggle}
            disabled={!user}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: user ? 'pointer' : 'not-allowed',
              padding: '8px',
              opacity: user ? 1 : 0.5
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? '#e74c3c' : 'none'}>
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke={isLiked ? '#e74c3c' : '#333'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontWeight: '500' }}>{likeCount}</span>
          </button>

          {/* Comment button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontWeight: '500' }}>{comments.length}</span>
          </button>

          {/* Share button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="#333" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="#333" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="#333" strokeWidth="2"/>
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="#333" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              <span style={{ fontWeight: '600' }}>
                {postAuthor?.displayName || 'Unknown'}
              </span>{' '}
              {post.caption}
            </p>
          </div>
        )}

        {/* Comments section */}
        <div style={{ padding: '12px 16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600' }}>
            Comments ({comments.length})
          </h3>

          {/* Comments list */}
          {comments.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.map((comment) => {
                const author = commentAuthors[comment.userId] || {};
                const isOwn = user?.uid === comment.userId;

                return (
                  <div key={comment.id} style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#ddd',
                      flexShrink: 0
                    }}>
                      {author.photoURL ? (
                        <img
                          src={author.photoURL}
                          alt={author.displayName}
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
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {(author.displayName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Comment content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            {author.displayName || 'Unknown'}
                          </span>
                          <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>
                            {formatTime(comment.createdAt)}
                          </span>
                        </div>
                        {isOwn && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#888',
                              padding: '4px'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        color: '#333'
                      }}>
                        {comment.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Comment input */}
      {user ? (
        <form
          onSubmit={handleAddComment}
          style={{
            display: 'flex',
            padding: '12px 16px',
            borderTop: '1px solid #eee',
            gap: '12px',
            backgroundColor: '#fff'
          }}
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3A2B20',
              color: '#FDF5DD',
              border: 'none',
              borderRadius: '24px',
              cursor: !newComment.trim() || isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: !newComment.trim() || isSubmitting ? 0.5 : 1
            }}
          >
            {isSubmitting ? '...' : 'Post'}
          </button>
        </form>
      ) : (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          textAlign: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3A2B20',
              color: '#FDF5DD',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Log in to comment
          </button>
        </div>
      )}

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

export default PostDetailScreen;
