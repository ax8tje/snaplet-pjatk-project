import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMessageStore } from '../store/messageStore';
import { useUserStore } from '../store/userStore';

const ChatScreen = () => {
  const { userId: partnerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const {
    currentConversation,
    isLoading,
    error,
    sendMessage,
    subscribeToChat,
    clearError
  } = useMessageStore();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const partnerName = location.state?.displayName || 'User';

  // Subscribe to conversation messages
  useEffect(() => {
    if (user?.uid && partnerId) {
      const unsubscribe = subscribeToChat(user.uid, partnerId);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user?.uid, partnerId, subscribeToChat]);

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#F5E6D3'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#F5E6D3',
        borderBottom: '1px solid #E0D5C7',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button
          onClick={() => navigate('/messages')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '8px'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#3A2B20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#3A2B20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FDF5DD',
          fontWeight: '600',
          marginRight: '12px'
        }}>
          {partnerName[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#3A2B20' }}>
            {partnerName}
          </h2>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            Loading messages...
          </div>
        )}

        {!isLoading && currentConversation.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
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
                backgroundColor: isOwnMessage ? '#3A2B20' : '#fff',
                color: isOwnMessage ? '#FDF5DD' : '#333',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.text}</p>
                <span style={{
                  display: 'block',
                  fontSize: '11px',
                  marginTop: '4px',
                  opacity: 0.7,
                  textAlign: 'right'
                }}>
                  {formatTime(msg.createdAt)}
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
        backgroundColor: '#F5E6D3',
        borderTop: '1px solid #E0D5C7',
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
            backgroundColor: '#fff',
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
            backgroundColor: messageText.trim() && !isSending ? '#3A2B20' : '#ccc',
            border: 'none',
            cursor: messageText.trim() && !isSending ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#FDF5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
