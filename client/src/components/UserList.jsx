import React from 'react';
import { FiX, FiCircle, FiMessageCircle } from 'react-icons/fi';
import './UserList.css';

const UserList = ({ users, currentUser, onUserClick, onClose }) => {
  const onlineUsers = users.filter(user => user.online);
  const offlineUsers = users.filter(user => !user.online);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#28a745';
      case 'away':
        return '#ffc107';
      case 'busy':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  const renderUser = (user) => {
    const isCurrentUser = user.id === currentUser?.id;
    
    return (
      <div key={user.id} className={`user-item ${isCurrentUser ? 'current-user' : ''}`}>
        <div className="user-avatar">
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
            alt={user.username}
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
            }}
          />
          {user.online && (
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(user.status) }}
            />
          )}
        </div>
        
        <div className="user-info">
          <div className="user-name">
            {user.username}
            {isCurrentUser && <span className="current-user-badge">(You)</span>}
          </div>
          <div className="user-status">
            {user.online ? getStatusText(user.status) : 'Offline'}
          </div>
        </div>
        
        {!isCurrentUser && user.online && (
          <button
            className="message-btn"
            onClick={() => onUserClick(user)}
            title="Send private message"
          >
            <FiMessageCircle />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Users ({users.length})</h3>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <div className="user-list-content">
        {onlineUsers.length > 0 && (
          <div className="user-section">
            <div className="section-header">
              <FiCircle style={{ color: '#28a745' }} />
              <span>Online ({onlineUsers.length})</span>
            </div>
            <div className="user-items">
              {onlineUsers.map(renderUser)}
            </div>
          </div>
        )}
        
        {offlineUsers.length > 0 && (
          <div className="user-section">
            <div className="section-header">
              <FiCircle style={{ color: '#6c757d' }} />
              <span>Offline ({offlineUsers.length})</span>
            </div>
            <div className="user-items">
              {offlineUsers.map(renderUser)}
            </div>
          </div>
        )}
        
        {users.length === 0 && (
          <div className="empty-users">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 