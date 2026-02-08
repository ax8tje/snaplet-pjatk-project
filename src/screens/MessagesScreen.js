import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessageStore } from '../store/messageStore';
import { useUserStore } from '../store/userStore';
import { getUserProfile } from '../services/userService';
import {
  getUserFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../services/friendService';

const MessagesScreen = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();
  const {
    conversations,
    isLoading: chatsLoading,
    error,
    fetchConversations,
    subscribeToUserConversations,
    clearError
  } = useMessageStore();

  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // Friends state
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchFriends = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const friendDocs = await getUserFriends(user.uid);
      const profiles = await Promise.all(
        friendDocs.map(async (f) => {
          const friendId = f.friendId || f.odUserId;
          try {
            const profile = await getUserProfile(friendId);
            return { uid: friendId, ...profile };
          } catch {
            return { uid: friendId, displayName: 'Unknown User', photoURL: '' };
          }
        })
      );
      setFriends(profiles);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  }, [user?.uid]);

  const fetchRequests = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const pendingRequests = await getPendingFriendRequests(user.uid);
      const enriched = await Promise.all(
        pendingRequests.map(async (req) => {
          try {
            const profile = await getUserProfile(req.senderId);
            return { ...req, senderProfile: profile };
          } catch {
            return { ...req, senderProfile: { displayName: 'Unknown User', photoURL: '' } };
          }
        })
      );
      setRequests(enriched);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  }, [user?.uid]);

  // Fetch friends + requests
  useEffect(() => {
    if (!user?.uid) return;
    setFriendsLoading(true);
    Promise.all([fetchFriends(), fetchRequests()]).finally(() => setFriendsLoading(false));
  }, [user?.uid, fetchFriends, fetchRequests]);

  // Fetch and subscribe to conversations
  useEffect(() => {
    if (user?.uid) {
      fetchConversations(user.uid);
      const unsubscribe = subscribeToUserConversations(user.uid);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user?.uid]);

  const handleAccept = async (requestId, senderId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await acceptFriendRequest(requestId, user.uid, senderId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      await fetchFriends();
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await rejectFriendRequest(requestId, user.uid);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv =>
      conv.odDisplayName.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Filter friends based on search
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter(f =>
      (f.displayName || '').toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date
      ? timestamp
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleChatClick = (userId, displayName) => {
    navigate(`/chat/${userId}`, { state: { displayName } });
  };

  if (!isAuthenticated || !user) {
    return (
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
          Please log in to view messages
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
    );
  }

  const isLoading = activeTab === 'friends' || activeTab === 'requests' ? friendsLoading : chatsLoading;

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>Messages</h1>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search friends...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              backgroundColor: 'var(--bg-input)',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" stroke="var(--text-muted)" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="var(--text-muted)" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
        {[
          { key: 'friends', label: 'Znajomi' },
          { key: 'chats', label: 'Czaty' },
          { key: 'requests', label: 'Zaproszenia' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--text-default)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? '600' : '400',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {tab.label}
            {tab.key === 'requests' && requests.length > 0 && (
              <span style={{
                backgroundColor: '#e74c3c',
                color: 'var(--bg-card)',
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '10px',
                marginLeft: '6px',
              }}>
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
          margin: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
          <button
            onClick={clearError}
            style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--spinner-track)',
            borderTop: '2px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      )}

      {/* ===== FRIENDS TAB ===== */}
      {!isLoading && activeTab === 'friends' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredFriends.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)',
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="var(--text-disabled)" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </p>
              <p style={{ fontSize: '14px' }}>
                {searchQuery ? 'Try a different search' : 'Search for users and send friend requests!'}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend.uid}
                onClick={() => navigate(`/chat/${friend.uid}`, { state: { displayName: friend.displayName } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Avatar */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-placeholder)',
                  marginRight: '12px',
                  flexShrink: 0,
                }}>
                  {friend.photoURL ? (
                    <img
                      src={friend.photoURL}
                      alt={friend.displayName}
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
                      fontSize: '20px',
                      fontWeight: '600',
                    }}>
                      {(friend.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span style={{ flex: 1, fontSize: '16px', fontWeight: '500', color: 'var(--text-default)' }}>
                  {friend.displayName || 'Unknown User'}
                </span>
                {/* Profile view button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${friend.uid}`);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    marginRight: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-disabled)',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-disabled)'}
                  title="View profile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--icon-muted)' }}>
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== CHATS TAB ===== */}
      {!isLoading && activeTab === 'chats' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="var(--text-disabled)" strokeWidth="2"/>
              </svg>
              {searchQuery ? (
                <>
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>No results found</p>
                  <p style={{ fontSize: '14px' }}>Try a different search term</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>No messages yet</p>
                  <p style={{ fontSize: '14px' }}>Start a conversation with friends!</p>
                </>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.odUserId}
                onClick={() => handleChatClick(conv.odUserId, conv.odDisplayName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: conv.unreadCount > 0 ? 'var(--bg-unread)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = conv.unreadCount > 0 ? 'var(--bg-unread)' : 'transparent'}
              >
                {/* Avatar */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-placeholder)',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  {conv.odPhotoURL ? (
                    <img
                      src={conv.odPhotoURL}
                      alt={conv.odDisplayName}
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
                      fontSize: '20px',
                      fontWeight: '600'
                    }}>
                      {conv.odDisplayName[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontWeight: conv.unreadCount > 0 ? '600' : '500',
                      fontSize: '16px',
                      color: 'var(--text-default)'
                    }}>
                      {conv.odDisplayName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: conv.unreadCount > 0 ? 'var(--text-default)' : 'var(--text-muted)',
                      fontWeight: conv.unreadCount > 0 ? '500' : '400',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-accent)',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '8px', color: 'var(--icon-muted)' }}>
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== REQUESTS TAB ===== */}
      {!isLoading && activeTab === 'requests' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {requests.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)',
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="7" r="4" stroke="var(--text-disabled)" strokeWidth="2"/>
                <line x1="20" y1="8" x2="20" y2="14" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="23" y1="11" x2="17" y2="11" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No pending requests</p>
              <p style={{ fontSize: '14px' }}>When someone sends you a friend request, it will appear here</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-placeholder)',
                  marginRight: '12px',
                  flexShrink: 0,
                }}>
                  {req.senderProfile.photoURL ? (
                    <img
                      src={req.senderProfile.photoURL}
                      alt={req.senderProfile.displayName}
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
                      fontSize: '20px',
                      fontWeight: '600',
                    }}>
                      {(req.senderProfile.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <span
                  style={{ flex: 1, fontSize: '16px', fontWeight: '500', color: 'var(--text-default)', cursor: 'pointer' }}
                  onClick={() => navigate(`/user/${req.senderId}`)}
                >
                  {req.senderProfile.displayName || 'Unknown User'}
                </span>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAccept(req.id, req.senderId)}
                    disabled={actionLoading[req.id]}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-accent)',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: actionLoading[req.id] ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      opacity: actionLoading[req.id] ? 0.6 : 1,
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading[req.id]}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--icon-muted)',
                      borderRadius: '20px',
                      cursor: actionLoading[req.id] ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      opacity: actionLoading[req.id] ? 0.6 : 1,
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
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

export default MessagesScreen;
