import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import './PrivateChat.css';

const PrivateChat = ({ user, messages, currentUser, onClose, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');
  };

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '00:00';
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.senderId === currentUser?.id;
    
    return (
      <div key={message.id} className={`private-message ${isOwnMessage ? 'own-message' : ''}`}>
        <div className="message-bubble">
          <div className="message-text">{message.message}</div>
          <div className="message-time">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="private-chat-overlay">
      <div className="private-chat-modal">
        <div className="private-chat-header">
          <button className="back-btn" onClick={onClose}>
            <FiArrowLeft />
          </button>
          
          <div className="user-info">
            <div className="user-avatar">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt={user.username}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                }}
              />
              <div className={`status-indicator ${user.online ? 'online' : 'offline'}`} />
            </div>
            
            <div className="user-details">
              <div className="user-name">{user.username}</div>
              <div className="user-status">
                {user.online ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
          
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="private-chat-messages">
          {messages.length === 0 ? (
            <div className="empty-private-chat">
              <div className="empty-icon">💬</div>
              <h3>Start a conversation</h3>
              <p>Send a message to {user.username}</p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="private-chat-input">
          <form onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message ${user.username}...`}
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!message.trim()}>
                <FiSend />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrivateChat; 