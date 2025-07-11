import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiHeart, FiThumbsUp, FiSmile, FiDownload } from 'react-icons/fi';
import './MessageList.css';

const MessageList = ({ messages, currentUser, onReaction }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '00:00';
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch (error) {
      return '';
    }
  };

  const renderMessage = (message, index) => {
    const isOwnMessage = message.senderId === currentUser?.id;
    const showDate = index === 0 || 
      formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);

    return (
      <div key={message.id} className="message-wrapper">
        {showDate && (
          <div className="date-divider">
            <span>{formatDate(message.timestamp)}</span>
          </div>
        )}
        
        <div className={`message ${isOwnMessage ? 'own-message' : ''}`}>
          {!isOwnMessage && (
            <div className="message-avatar">
              <img 
                src={message.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} 
                alt={message.sender}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`;
                }}
              />
            </div>
          )}
          
          <div className="message-content">
            {!isOwnMessage && (
              <div className="message-sender">{message.sender}</div>
            )}
            
            <div className="message-bubble">
              {message.type === 'file' ? (
                <div className="file-message">
                  <div className="file-info">
                    <FiDownload className="file-icon" />
                    <span className="file-name">{message.message}</span>
                  </div>
                  <div className="file-meta">
                    {message.fileType} • {formatFileSize(message.fileSize)}
                  </div>
                  <button className="btn btn-secondary download-btn">
                    Download
                  </button>
                </div>
              ) : (
                <div className="message-text">{message.message}</div>
              )}
              
              <div className="message-meta">
                <span className="message-time">{formatTime(message.timestamp)}</span>
                {isOwnMessage && message.readBy && message.readBy.length > 1 && (
                  <span className="read-status">✓✓</span>
                )}
              </div>
            </div>
            
            <div className="message-reactions">
              {message.reactions && Object.entries(message.reactions).map(([reaction, users]) => (
                <button
                  key={reaction}
                  className="reaction-btn"
                  onClick={() => onReaction(message.id, reaction)}
                  title={`${users.length} ${reaction}`}
                >
                  {getReactionIcon(reaction)} {users.length}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getReactionIcon = (reaction) => {
    switch (reaction) {
      case 'like':
        return <FiThumbsUp />;
      case 'love':
        return <FiHeart />;
      case 'smile':
        return <FiSmile />;
      default:
        return reaction;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No messages yet</h3>
          <p>Start the conversation by sending a message!</p>
        </div>
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 