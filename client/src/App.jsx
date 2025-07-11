import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './socket/socket';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser, isConnected, error } = useSocket();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('chatToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
      localStorage.setItem('chatToken', 'authenticated'); // In a real app, store the actual JWT token
    }
  }, [currentUser]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chatToken');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <Login />
            } 
          />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? 
                <Chat onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/chat" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 