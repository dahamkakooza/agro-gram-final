// Notifications.jsx
import React, { useState, useEffect } from 'react';
import { messagingAPI, marketplaceAPI } from '@agro-gram/api';
import { Card, Button, Badge } from '@agro-gram/ui';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const result = await messagingAPI.getNotifications();
      if (result.success) {
        const notificationsData = result.data.notifications || result.data || [];
        setNotifications(notificationsData.slice(0, 5)); // Show last 5
        setUnreadCount(result.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    try {
      await messagingAPI.markNotificationRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Navigate based on notification type
    if (notification.related_conversation) {
      navigate('/messages');
    } else {
      navigate('/orders');
    }

    setShowDropdown(false);
  };

  const markAllAsRead = async () => {
    try {
      await messagingAPI.getNotifications({ mark_read: true });
      setUnreadCount(0);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notifications-wrapper">
      <Button 
        variant="text" 
        onClick={() => setShowDropdown(!showDropdown)}
        className="notifications-button"
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <Badge variant="error" className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <Card className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="text" size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <Button 
              variant="text" 
              size="small" 
              onClick={() => {
                navigate('/messages');
                setShowDropdown(false);
              }}
            >
              View All Messages
            </Button>
            <Button 
              variant="text" 
              size="small" 
              onClick={() => {
                navigate('/orders');
                setShowDropdown(false);
              }}
            >
              View All Orders
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Notifications;