import React from 'react';
import { FiX, FiMessageCircle, FiUsers } from 'react-icons/fi';
import './RoomList.css';

const RoomList = ({ rooms, currentRoom, onRoomClick, onClose }) => {
  const renderRoom = (room) => {
    const isCurrentRoom = currentRoom?.id === room.id;
    
    return (
      <div 
        key={room.id} 
        className={`room-item ${isCurrentRoom ? 'current-room' : ''}`}
        onClick={() => onRoomClick(room)}
      >
        <div className="room-icon">
          <FiMessageCircle />
        </div>
        
        <div className="room-info">
          <div className="room-name">
            {room.name}
            {isCurrentRoom && <span className="current-room-badge">Current</span>}
          </div>
          <div className="room-description">{room.description}</div>
          <div className="room-meta">
            <FiUsers />
            <span>{room.userCount || 0} users</span>
          </div>
        </div>
        
        <div className="room-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Chat Rooms ({rooms.length})</h3>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <div className="room-list-content">
        {rooms.length > 0 ? (
          <div className="room-items">
            {rooms.map(renderRoom)}
          </div>
        ) : (
          <div className="empty-rooms">
            <p>No rooms available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList; 