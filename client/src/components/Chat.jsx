import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiLogOut, FiUsers, FiMessageCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import MessageList from './MessageList';
import UserList from './UserList';
import RoomList from './RoomList';
import PrivateChat from './PrivateChat';
import './Chat.css';

const Chat = ({ onLogout }) => {
  const {
    currentUser,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    roomUsers,
    notifications,
    privateMessages,
    isConnected,
    sendMessage,
    setTyping,
    joinRoom,
    disconnect,
    getNotifications
  } = useSocket();

  const [message, setMessage] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messageInputRef = useRef(null);

  // Handle typing indicator
  useEffect(() => {
    if (isTyping) {
      setTyping(true);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setTyping(false);
      }, 2000);
      setTypingTimeout(timeout);
    } else {
      setTyping(false);
    }
  }, [isTyping, setTyping]);

  // Handle notifications
  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        toast(notification.message, {
          icon: '🔔',
          duration: 4000,
        });
      });
    }
  }, [notifications]);

  // Request notifications on mount
  useEffect(() => {
    if (isConnected) {
      getNotifications();
    }
  }, [isConnected, getNotifications]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    sendMessage(message.trim());
    setMessage('');
    setIsTyping(false);
    setTyping(false);
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload
      toast.success('File upload feature coming soon!');
    }
  };

  const handlePrivateChat = (user) => {
    setSelectedUser(user);
    setShowPrivateChat(true);
    setShowUserList(false);
  };

  const handleLogout = () => {
    disconnect();
    onLogout();
  };

  if (!currentUser) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Connecting...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h2>{currentRoom?.name || 'Chat'}</h2>
          <div className="room-info">
            <span className="user-count">{roomUsers.length} users</span>
            {typingUsers.length > 0 && (
              <span className="typing-indicator">
                {typingUsers.join(', ')} typing...
              </span>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <button
            className="btn btn-secondary header-btn"
            onClick={() => setShowRoomList(!showRoomList)}
            title="Rooms"
          >
            <FiMessageCircle />
          </button>
          
          <button
            className="btn btn-secondary header-btn"
            onClick={() => setShowUserList(!showUserList)}
            title="Users"
          >
            <FiUsers />
          </button>
          
          <div className="user-menu">
            <button className="btn btn-secondary header-btn">
              <FiMoreVertical />
            </button>
            <div className="dropdown-menu">
              <button onClick={handleLogout} className="dropdown-item">
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Sidebar */}
        {(showUserList || showRoomList) && (
          <div className="chat-sidebar">
            {showUserList && (
              <UserList
                users={users}
                currentUser={currentUser}
                onUserClick={handlePrivateChat}
                onClose={() => setShowUserList(false)}
              />
            )}
            
            {showRoomList && (
              <RoomList
                rooms={rooms}
                currentRoom={currentRoom}
                onRoomClick={(room) => {
                  joinRoom(room.id);
                  setShowRoomList(false);
                }}
                onClose={() => setShowRoomList(false)}
              />
            )}
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          <MessageList
            messages={messages}
            currentUser={currentUser}
            onReaction={(messageId, reaction) => {
              // Handle reaction
              toast.success('Reaction feature coming soon!');
            }}
          />
        </div>
      </div>

      {/* Message Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="input-wrapper">
            <input
              ref={messageInputRef}
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              className="message-input"
              disabled={!currentRoom}
            />
            
            <div className="input-actions">
              <label className="file-upload-btn">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <FiPaperclip />
              </label>
              
              <button type="submit" className="send-btn" disabled={!message.trim()}>
                <FiSend />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Private Chat Modal */}
      {showPrivateChat && selectedUser && (
        <PrivateChat
          user={selectedUser}
          messages={privateMessages}
          currentUser={currentUser}
          onClose={() => {
            setShowPrivateChat(false);
            setSelectedUser(null);
          }}
          onSendMessage={(message) => {
            // Handle private message
            toast.success('Private messaging coming soon!');
          }}
        />
      )}
    </div>
  );
};

export default Chat; 