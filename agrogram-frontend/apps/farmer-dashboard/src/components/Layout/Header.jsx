import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Badge } from '@agro-gram/ui';
import { messagingAPI } from '@agro-gram/api';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__brand">
          <h1>🌱 Agro-Gram</h1>
          <span className="header__subtitle">Farmer Dashboard</span>
        </div>
        
        <div className="header__user">
          {userProfile && (
            <div className="user-info">
              <span className="user-info__name">
                {userProfile.first_name || userProfile.email}
              </span>
              <span className="user-info__role">
                {userProfile.role}
              </span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
      <Navigation />
    </header>
  );
};

const Navigation = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const navigate = useNavigate();
  const { ensureFreshToken } = useAuth();

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 60 seconds instead of 30
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    // Don't fetch if already loading
    if (notificationsLoading) return;
    
    try {
      setNotificationsLoading(true);
      
      // Ensure we have a fresh token before making the request
      await ensureFreshToken();
      
      const result = await messagingAPI.getNotifications();
      if (result.success) {
        setUnreadCount(result.data.unread_count || 0);
      } else if (result.status === 401 || result.status === 403) {
        console.warn('Authentication error fetching notifications:', result.error);
        setUnreadCount(0);
      } else {
        console.warn('Failed to fetch notifications:', result.error);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMessagesClick = () => {
    navigate('/messages');
    // Refresh count when navigating to messages
    setTimeout(fetchUnreadCount, 1000);
  };

  return (
    <nav className="main-navigation">
      <div className="nav-links">
        <Button variant="text" onClick={() => navigate('/marketplace')}>
          🏪 Marketplace
        </Button>
        
        <Button variant="text" onClick={() => navigate('/orders')}>
          📦 Orders
        </Button>
        
        <Button 
          variant="text" 
          onClick={handleMessagesClick}
          className="messages-button"
          disabled={notificationsLoading}
        >
          💬 Messages
          {unreadCount > 0 && (
            <Badge variant="error" className="unread-badge">
              {unreadCount}
            </Badge>
          )}
          {notificationsLoading && (
            <span className="loading-indicator">⟳</span>
          )}
        </Button>
      </div>
    </nav>
  );
};

export default Header;