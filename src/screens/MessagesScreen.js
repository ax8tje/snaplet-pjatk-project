import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useMessageStore } from '../store/messageStore';
import { useUserStore } from '../store/userStore';

const MessagesScreen = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();
  const {
    conversations,
    isLoading,
    error,
    fetchConversations,
    subscribeToUserConversations,
    clearError
  } = useMessageStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(conv =>
      conv.odDisplayName.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

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

  // Navigate to chat
  const handleChatClick = (userId, displayName) => {
    navigate(`/chat/${userId}`, { state: { displayName } });
  };

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="screen messages-screen">
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
            Please log in to view messages
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
        <BottomNav active="messages" />
      </div>
    );
  }

  return (
    <div className="screen messages-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #eee'
      }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: '600' }}>Messages</h1>

        {/* Search bar */}
        <div style={{
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search for message"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              backgroundColor: '#f5f5f5',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <circle cx="11" cy="11" r="8" stroke="#888" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#888" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eee'
      }}>
        {['contacts', 'all', 'groups'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px',
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
            {tab === 'all' ? 'All chats' : tab}
          </button>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          margin: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
          <button
            onClick={clearError}
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

      {/* Loading state */}
      {isLoading && conversations.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3A2B20',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#888' }}>Loading conversations...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredConversations.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: '#666'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#999" strokeWidth="2"/>
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
      )}

      {/* Conversations list */}
      {filteredConversations.length > 0 && (
        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          {filteredConversations.map((conv) => (
            <div
              key={conv.odUserId}
              onClick={() => handleChatClick(conv.odUserId, conv.odDisplayName)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                backgroundColor: conv.unreadCount > 0 ? '#f8f8f8' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = conv.unreadCount > 0 ? '#f8f8f8' : 'transparent'}
            >
              {/* Avatar */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#ddd',
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
                    backgroundColor: '#3A2B20',
                    color: '#FDF5DD',
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
                    color: '#333'
                  }}>
                    {conv.odDisplayName}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#888'
                  }}>
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
                    color: conv.unreadCount > 0 ? '#333' : '#888',
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
                      backgroundColor: '#3A2B20',
                      color: '#FDF5DD',
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

              {/* Arrow icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginLeft: '8px', color: '#ccc' }}
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* New message button */}
      <div
        onClick={() => navigate('/friends')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#3A2B20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 100
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#FDF5DD" strokeWidth="2"/>
          <path d="M12 8V14M9 11H15" stroke="#FDF5DD" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <BottomNav active="messages" />

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
