// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState, useCallback } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Custom hook for using socket.io with advanced features
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [privateMessages, setPrivateMessages] = useState(new Map());
  const [error, setError] = useState(null);

  // Connect to socket server
  const connect = useCallback((userData) => {
    socket.connect();
    if (userData) {
      socket.emit('user_join', userData);
    }
  }, []);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socket.disconnect();
    setCurrentUser(null);
    setMessages([]);
    setUsers([]);
    setTypingUsers([]);
    setRooms([]);
    setCurrentRoom(null);
    setRoomUsers([]);
    setNotifications([]);
    setPrivateMessages(new Map());
  }, []);

  // Join a room
  const joinRoom = useCallback((roomId) => {
    socket.emit('join_room', roomId);
  }, []);

  // Send a message to current room
  const sendMessage = useCallback((message, type = 'text') => {
    if (!currentRoom) return;
    socket.emit('send_message', { roomId: currentRoom.id, message, type });
  }, [currentRoom]);

  // Send a private message
  const sendPrivateMessage = useCallback((toUserId, message, type = 'text') => {
    socket.emit('private_message', { toUserId, message, type });
  }, []);

  // Set typing status
  const setTyping = useCallback((isTyping) => {
    if (!currentRoom) return;
    socket.emit('typing', { roomId: currentRoom.id, isTyping });
  }, [currentRoom]);

  // Add reaction to message
  const addReaction = useCallback((messageId, reaction) => {
    if (!currentRoom) return;
    socket.emit('message_reaction', { messageId, roomId: currentRoom.id, reaction });
  }, [currentRoom]);

  // Mark message as read
  const markMessageRead = useCallback((messageId) => {
    if (!currentRoom) return;
    socket.emit('mark_read', { messageId, roomId: currentRoom.id });
  }, [currentRoom]);

  // Upload file
  const uploadFile = useCallback((file) => {
    if (!currentRoom) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('file_upload', {
        roomId: currentRoom.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: reader.result
      });
    };
    reader.readAsDataURL(file);
  }, [currentRoom]);

  // Update user status
  const updateStatus = useCallback((status) => {
    socket.emit('update_status', status);
  }, []);

  // Get notifications
  const getNotifications = useCallback(() => {
    socket.emit('get_notifications');
  }, []);

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (error) => {
      setError('Connection failed');
      console.error('Socket connection error:', error);
    };

    // Authentication events
    const onAuthSuccess = (data) => {
      setCurrentUser(data.user);
      setError(null);
      // Join default room after authentication
      joinRoom('general');
    };

    const onAuthError = (data) => {
      setError(data.message);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setPrivateMessages(prev => {
        const key = [message.senderId, message.recipientId].sort().join('-');
        const existing = prev.get(key) || [];
        return new Map(prev).set(key, [...existing, message]);
      });
    };

    const onRoomMessages = (data) => {
      setMessages(data.messages || []);
    };

    const onRoomJoined = (room) => {
      setCurrentRoom(room);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onRoomUsers = (data) => {
      setRoomUsers(data.users);
    };

    const onUserStatusUpdate = (data) => {
      setUsers(prev => 
        prev.map(user => 
          user.id === data.userId 
            ? { ...user, status: data.status }
            : user
        )
      );
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Reaction events
    const onMessageReaction = (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId
            ? { ...msg, reactions: { ...msg.reactions, [data.reaction]: data.users } }
            : msg
        )
      );
    };

    // Read receipt events
    const onMessageRead = (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId
            ? { ...msg, readBy: data.readBy }
            : msg
        )
      );
    };

    // Notification events
    const onNotifications = (userNotifications) => {
      setNotifications(userNotifications);
    };

    // Error events
    const onError = (data) => {
      setError(data.message);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('auth_success', onAuthSuccess);
    socket.on('auth_error', onAuthError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('room_messages', onRoomMessages);
    socket.on('room_joined', onRoomJoined);
    socket.on('user_list', onUserList);
    socket.on('room_users', onRoomUsers);
    socket.on('user_status_update', onUserStatusUpdate);
    socket.on('typing_users', onTypingUsers);
    socket.on('message_reaction', onMessageReaction);
    socket.on('message_read', onMessageRead);
    socket.on('notifications', onNotifications);
    socket.on('error', onError);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('auth_success', onAuthSuccess);
      socket.off('auth_error', onAuthError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('room_messages', onRoomMessages);
      socket.off('room_joined', onRoomJoined);
      socket.off('user_list', onUserList);
      socket.off('room_users', onRoomUsers);
      socket.off('user_status_update', onUserStatusUpdate);
      socket.off('typing_users', onTypingUsers);
      socket.off('message_reaction', onMessageReaction);
      socket.off('message_read', onMessageRead);
      socket.off('notifications', onNotifications);
      socket.off('error', onError);
    };
  }, [joinRoom]);

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const roomsData = await response.json();
        setRooms(roomsData);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };

    if (isConnected) {
      loadRooms();
    }
  }, [isConnected]);

  return {
    socket,
    isConnected,
    currentUser,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    roomUsers,
    notifications,
    privateMessages,
    error,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    markMessageRead,
    uploadFile,
    updateStatus,
    getNotifications,
  };
};

export default socket; 