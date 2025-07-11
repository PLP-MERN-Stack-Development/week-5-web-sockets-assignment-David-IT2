// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage (in production, use a database)
const users = new Map();
const messages = new Map();
const rooms = new Map();
const typingUsers = new Map();
const userSessions = new Map();
const notifications = new Map();

// Initialize default rooms
rooms.set('general', {
  id: 'general',
  name: 'General',
  description: 'General chat room',
  messages: [],
  users: new Set()
});

rooms.set('random', {
  id: 'random',
  name: 'Random',
  description: 'Random topics',
  messages: [],
  users: new Set()
});

rooms.set('help', {
  id: 'help',
  name: 'Help & Support',
  description: 'Get help and support',
  messages: [],
  users: new Set()
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Invalid token'));
    }
    socket.user = user;
    next();
  });
};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user authentication and joining
  socket.on('user_join', async (userData) => {
    try {
      const { username, password, isNewUser } = userData;
      
      if (isNewUser) {
        // Register new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });
        
        users.set(userId, {
          id: userId,
          username,
          password: hashedPassword,
          online: true,
          lastSeen: new Date(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          status: 'online'
        });
        
        userSessions.set(socket.id, userId);
        socket.userId = userId;
        socket.username = username;
        
        socket.emit('auth_success', { token, user: users.get(userId) });
      } else {
        // Login existing user
        const user = Array.from(users.values()).find(u => u.username === username);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
          socket.emit('auth_error', { message: 'Invalid credentials' });
          return;
        }
        
        const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: '24h' });
        user.online = true;
        user.lastSeen = new Date();
        user.status = 'online';
        
        userSessions.set(socket.id, user.id);
        socket.userId = user.id;
        socket.username = username;
        
        socket.emit('auth_success', { token, user });
      }
      
      // Join default room
      socket.join('general');
      rooms.get('general').users.add(socket.userId);
      
      // Broadcast user list update
      io.emit('user_list', Array.from(users.values()));
      io.emit('room_users', {
        roomId: 'general',
        users: Array.from(rooms.get('general').users)
      });
      
      console.log(`${username} joined the chat`);
    } catch (error) {
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  });

  // Handle room joining
  socket.on('join_room', (roomId) => {
    if (!socket.userId) return;
    
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Leave current room
    socket.rooms.forEach(roomName => {
      if (roomName !== socket.id && rooms.has(roomName)) {
        rooms.get(roomName).users.delete(socket.userId);
        socket.leave(roomName);
      }
    });
    
    // Join new room
    socket.join(roomId);
    room.users.add(socket.userId);
    
    // Send room messages
    socket.emit('room_messages', {
      roomId,
      messages: room.messages.slice(-50) // Last 50 messages
    });
    
    // Broadcast room users update
    io.to(roomId).emit('room_users', {
      roomId,
      users: Array.from(room.users)
    });
    
    socket.emit('room_joined', room);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    if (!socket.userId) return;
    
    const { roomId, message, type = 'text' } = messageData;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const messageObj = {
      id: uuidv4(),
      roomId,
      sender: socket.username,
      senderId: socket.userId,
      message,
      type,
      timestamp: new Date().toISOString(),
      readBy: new Set([socket.userId]),
      reactions: new Map()
    };
    
    room.messages.push(messageObj);
    
    // Limit stored messages to prevent memory issues
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    
    // Broadcast to room
    io.to(roomId).emit('receive_message', messageObj);
    
    // Send notification to offline users
    room.users.forEach(userId => {
      if (!users.get(userId)?.online) {
        const userNotifications = notifications.get(userId) || [];
        userNotifications.push({
          type: 'new_message',
          roomId,
          sender: socket.username,
          message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          timestamp: new Date().toISOString()
        });
        notifications.set(userId, userNotifications);
      }
    });
  });

  // Handle private messages
  socket.on('private_message', (messageData) => {
    if (!socket.userId) return;
    
    const { toUserId, message, type = 'text' } = messageData;
    const recipient = users.get(toUserId);
    
    if (!recipient) {
      socket.emit('error', { message: 'User not found' });
      return;
    }
    
    const messageObj = {
      id: uuidv4(),
      type: 'private',
      sender: socket.username,
      senderId: socket.userId,
      recipient: recipient.username,
      recipientId: toUserId,
      message,
      messageType: type,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Store private message
    const privateKey = [socket.userId, toUserId].sort().join('-');
    if (!messages.has(privateKey)) {
      messages.set(privateKey, []);
    }
    messages.get(privateKey).push(messageObj);
    
    // Send to recipient if online
    const recipientSocket = Array.from(io.sockets.sockets.values())
      .find(s => s.userId === toUserId);
    
    if (recipientSocket) {
      recipientSocket.emit('private_message', messageObj);
    } else {
      // Store notification for offline user
      const userNotifications = notifications.get(toUserId) || [];
      userNotifications.push({
        type: 'private_message',
        sender: socket.username,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        timestamp: new Date().toISOString()
      });
      notifications.set(toUserId, userNotifications);
    }
    
    // Send back to sender
    socket.emit('private_message', messageObj);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    if (!socket.userId) return;
    
    const { roomId, isTyping } = data;
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    if (isTyping) {
      typingUsers.set(socket.id, {
        username: socket.username,
        roomId
      });
    } else {
      typingUsers.delete(socket.id);
    }
    
    // Broadcast typing status to room
    const roomTypingUsers = Array.from(typingUsers.values())
      .filter(user => user.roomId === roomId)
      .map(user => user.username);
    
    io.to(roomId).emit('typing_users', roomTypingUsers);
  });

  // Handle message reactions
  socket.on('message_reaction', (data) => {
    const { messageId, roomId, reaction } = data;
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    const message = room.messages.find(m => m.id === messageId);
    if (!message) return;
    
    if (!message.reactions.has(reaction)) {
      message.reactions.set(reaction, new Set());
    }
    
    message.reactions.get(reaction).add(socket.userId);
    
    io.to(roomId).emit('message_reaction', {
      messageId,
      reaction,
      users: Array.from(message.reactions.get(reaction))
    });
  });

  // Handle read receipts
  socket.on('mark_read', (data) => {
    const { messageId, roomId } = data;
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    const message = room.messages.find(m => m.id === messageId);
    if (!message) return;
    
    message.readBy.add(socket.userId);
    
    io.to(roomId).emit('message_read', {
      messageId,
      readBy: Array.from(message.readBy)
    });
  });

  // Handle file upload
  socket.on('file_upload', (data) => {
    if (!socket.userId) return;
    
    const { roomId, fileName, fileType, fileSize, fileData } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const messageObj = {
      id: uuidv4(),
      roomId,
      sender: socket.username,
      senderId: socket.userId,
      message: fileName,
      type: 'file',
      fileType,
      fileSize,
      fileData,
      timestamp: new Date().toISOString(),
      readBy: new Set([socket.userId]),
      reactions: new Map()
    };
    
    room.messages.push(messageObj);
    
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    
    io.to(roomId).emit('receive_message', messageObj);
  });

  // Handle user status updates
  socket.on('update_status', (status) => {
    if (!socket.userId) return;
    
    const user = users.get(socket.userId);
    if (user) {
      user.status = status;
      io.emit('user_status_update', { userId: socket.userId, status });
    }
  });

  // Handle notifications request
  socket.on('get_notifications', () => {
    if (!socket.userId) return;
    
    const userNotifications = notifications.get(socket.userId) || [];
    socket.emit('notifications', userNotifications);
    notifications.delete(socket.userId); // Clear notifications after sending
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      const user = users.get(socket.userId);
      if (user) {
        user.online = false;
        user.lastSeen = new Date();
        user.status = 'offline';
      }
      
      // Remove from typing users
      typingUsers.delete(socket.id);
      
      // Remove from all rooms
      rooms.forEach(room => {
        room.users.delete(socket.userId);
      });
      
      userSessions.delete(socket.id);
      
      // Broadcast user list update
      io.emit('user_list', Array.from(users.values()));
      
      console.log(`${socket.username || 'User'} left the chat`);
    }
  });
});

// API routes
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    description: room.description,
    userCount: room.users.size
  }));
  res.json(roomList);
});

app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

app.get('/api/messages/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room.messages.slice(-50));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available rooms: ${Array.from(rooms.keys()).join(', ')}`);
});

module.exports = { app, server, io }; 