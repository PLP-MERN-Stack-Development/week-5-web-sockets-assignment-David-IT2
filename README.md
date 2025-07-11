# 🚀 Real-Time Chat Application with Socket.io

A modern, feature-rich real-time chat application built with React, Node.js, and Socket.io. This application demonstrates advanced real-time communication features including user authentication, multiple chat rooms, private messaging, typing indicators, read receipts, and more.

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure user authentication with password hashing
- **JWT Token Authentication**: Stateless authentication with JSON Web Tokens
- **User Profiles**: Avatar generation using DiceBear API
- **Online/Offline Status**: Real-time user presence indicators

### 💬 Core Chat Features
- **Real-time Messaging**: Instant message delivery using Socket.io
- **Multiple Chat Rooms**: Join different channels (General, Random, Help & Support)
- **Private Messaging**: Direct messages between users
- **Message History**: Persistent message storage (last 100 messages per room)
- **Typing Indicators**: See when users are typing in real-time

### 🎯 Advanced Features
- **Read Receipts**: Track message read status
- **Message Reactions**: React to messages with emojis (like, love, smile)
- **File Sharing**: Upload and share files (coming soon)
- **Real-time Notifications**: Browser notifications for new messages
- **User Status Updates**: Set custom status (online, away, busy)

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Dark/Light Theme**: Beautiful gradient backgrounds
- **Real-time Updates**: Live user lists and room information

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Socket.io Client**: Real-time communication
- **React Router**: Client-side routing
- **React Icons**: Beautiful icon library
- **React Hot Toast**: Elegant notifications
- **Date-fns**: Date formatting utilities

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Socket.io**: Real-time bidirectional communication
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **uuid**: Unique identifier generation
- **CORS**: Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd socketio-chat-app
```

### 2. Install Dependencies

#### Server Dependencies
```bash
cd server
npm install
```

#### Client Dependencies
```bash
cd client
npm install
```

### 3. Environment Setup

Create a `.env` file in the server directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key-here
```

### 4. Start the Application

#### Start the Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

#### Start the Client
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

## 🚀 Usage

### Getting Started
1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account or log in with existing credentials
3. Join a chat room and start messaging!

### Features Guide

#### Joining Rooms
- Click the "Rooms" button in the header to see available chat rooms
- Select a room to join and start chatting
- View room information and user count

#### User Management
- Click the "Users" button to see all online and offline users
- Click the message icon next to a user to start a private conversation
- See user status indicators (online, away, busy, offline)

#### Messaging
- Type your message and press Enter or click the send button
- See typing indicators when other users are composing messages
- React to messages by clicking the reaction buttons
- View read receipts for your sent messages

#### Private Messaging
- Click on a user in the user list to start a private chat
- Private messages are separate from room messages
- Real-time notifications for private messages

## 📁 Project Structure

```
socketio-chat-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── UserList.jsx
│   │   │   ├── RoomList.jsx
│   │   │   └── PrivateChat.jsx
│   │   ├── socket/        # Socket.io client setup
│   │   │   └── socket.js
│   │   ├── App.jsx        # Main application
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── server.js          # Main server file
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Server Endpoints
- `GET /api/rooms` - Get all available rooms
- `GET /api/users` - Get all users
- `GET /api/messages/:roomId` - Get room messages

### Socket Events

#### Client to Server
- `user_join` - User authentication
- `join_room` - Join a chat room
- `send_message` - Send a message to a room
- `private_message` - Send a private message
- `typing` - Typing indicator
- `message_reaction` - Add reaction to message
- `mark_read` - Mark message as read
- `file_upload` - Upload a file
- `update_status` - Update user status
- `get_notifications` - Request notifications

#### Server to Client
- `auth_success` - Authentication successful
- `auth_error` - Authentication failed
- `receive_message` - New message received
- `private_message` - Private message received
- `room_messages` - Room messages loaded
- `room_joined` - Successfully joined room
- `user_list` - Updated user list
- `room_users` - Room users update
- `user_status_update` - User status change
- `typing_users` - Typing indicators
- `message_reaction` - Message reaction update
- `message_read` - Read receipt update
- `notifications` - User notifications

## 🎯 Advanced Features Implementation

### 1. Real-time Messaging
- Bidirectional communication using Socket.io
- Message persistence with automatic cleanup
- Room-based message routing

### 2. User Authentication
- Secure password hashing with bcryptjs
- JWT token-based authentication
- Session management

### 3. Multiple Chat Rooms
- Dynamic room management
- Room-specific user lists
- Room switching with message history

### 4. Private Messaging
- Direct user-to-user communication
- Separate message storage
- Real-time delivery

### 5. Typing Indicators
- Real-time typing status
- Room-specific indicators
- Automatic timeout

### 6. Read Receipts
- Message read tracking
- Visual indicators
- Real-time updates

### 7. Message Reactions
- Emoji-based reactions
- Reaction counters
- Real-time updates

### 8. File Sharing
- File upload support
- File type detection
- Download functionality

### 9. Notifications
- Browser notifications
- Sound alerts
- Unread message tracking

### 10. User Status
- Online/offline status
- Custom status messages
- Real-time updates

## 🚀 Deployment

### Server Deployment (Render/Railway/Heroku)
1. Set environment variables
2. Deploy to your preferred platform
3. Update client configuration

### Client Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

## 🔒 Security Features

- **Password Hashing**: Secure password storage using bcryptjs
- **JWT Authentication**: Stateless authentication with expiration
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Built-in protection against spam

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Room joining and switching
- [ ] Message sending and receiving
- [ ] Private messaging
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message reactions
- [ ] File uploads
- [ ] User status updates
- [ ] Notifications
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Socket.io for real-time communication
- React team for the amazing framework
- DiceBear for avatar generation
- React Icons for beautiful icons


