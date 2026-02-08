import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMessageStore } from '../store/messageStore';
import { useUserStore } from '../store/userStore';
import { checkFriendship } from '../services/friendService';

const ChatScreen = () => {
  const { id: partnerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const {
    currentConversation,
    isLoading,
    error,
    sendMessage,
    subscribeToChat,
    markAsRead,
    clearError
  } = useMessageStore();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFriend, setIsFriend] = useState(null); // null = checking
  const messagesEndRef = useRef(null);
  const partnerName = location.state?.displayName || 'User';

  // Check friendship before allowing chat
  useEffect(() => {
    if (user?.uid && partnerId) {
      setIsFriend(null);
      checkFriendship(user.uid, partnerId)
        .then((result) => setIsFriend(result))
        .catch(() => setIsFriend(false));
    }
  }, [user?.uid, partnerId]);

  // Subscribe to conversation messages (only if friends)
  useEffect(() => {
    if (user?.uid && partnerId && isFriend === true) {
      const unsubscribe = subscribeToChat(user.uid, partnerId);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user?.uid, partnerId, isFriend, subscribeToChat]);

  // Mark unread messages as read
  useEffect(() => {
    if (!user?.uid || !currentConversation.length) return;
    const unread = currentConversation.filter(
      (msg) => !msg.read && msg.receiverId === user.uid && !msg.messageId.startsWith('temp_')
    );
    unread.forEach((msg) => markAsRead(msg.messageId));
  }, [currentConversation, user?.uid, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp instanceof Date
      ? timestamp
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sending message
  const handleSend = async () => {
    if (!messageText.trim() || isSending || !user?.uid || !partnerId) return;

    setIsSending(true);
    try {
      await sendMessage(user.uid, partnerId, messageText.trim());
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Friendship checking state
  if (isFriend === null) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--bg-page)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--spinner-track)',
          borderTop: '2px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Checking...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not friends — block access
  if (isFriend === false) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--bg-page)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
          <circle cx="12" cy="12" r="10" stroke="#999" strokeWidth="2"/>
          <path d="M4.93 4.93l14.14 14.14" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Cannot send messages
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          You need to be friends to message this user.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-accent)',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg-page)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button
          onClick={() => navigate('/messages', { state: { fromTab: location.state?.fromTab } })}
          style={{
            background: 'none',
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

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent)',
          fontWeight: '600',
          marginRight: '12px'
        }}>
          {partnerName[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--color-primary)' }}>
            {partnerName}
          </h2>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
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

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {isLoading && currentConversation.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading messages...
          </div>
        )}

        {!isLoading && currentConversation.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-muted)'
          }}>
            <p>No messages yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Send a message to start the conversation!</p>
          </div>
        )}

        {currentConversation.map((msg) => {
          const isOwnMessage = msg.senderId === user?.uid;

          return (
            <div
              key={msg.messageId}
              style={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: '18px',
                backgroundColor: isOwnMessage ? 'var(--msg-own-bg)' : 'var(--msg-other-bg)',
                color: isOwnMessage ? 'var(--msg-own-text)' : 'var(--msg-other-text)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.text}</p>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  fontSize: '11px',
                  marginTop: '4px',
                  opacity: 0.7,
                }}>
                  {formatTime(msg.createdAt)}
                  {isOwnMessage && (
                    <span style={{
                      fontSize: '13px',
                      color: msg.read ? '#34B7F1' : 'inherit',
                      fontWeight: '600',
                      letterSpacing: '-2px',
                      marginLeft: '2px',
                    }}>
                      {msg.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-page)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-default)',
            border: 'none',
            borderRadius: '24px',
            fontSize: '16px',
            outline: 'none'
          }}
        />

        <button
          onClick={handleSend}
          disabled={!messageText.trim() || isSending}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: messageText.trim() && !isSending ? 'var(--color-primary)' : 'var(--icon-muted)',
            border: 'none',
            cursor: messageText.trim() && !isSending ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
