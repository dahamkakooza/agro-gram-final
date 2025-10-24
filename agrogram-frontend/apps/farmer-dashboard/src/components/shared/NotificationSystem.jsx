// src/components/shared/NotificationSystem.jsx
import React, { useState, useEffect } from 'react';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // Listen for custom notification events
  useEffect(() => {
    const handleShowNotification = (event) => {
      const { type, title, message, duration = 5000 } = event.detail;
      showNotification(type, title, message, duration);
    };

    window.addEventListener('showNotification', handleShowNotification);
    return () => window.removeEventListener('showNotification', handleShowNotification);
  }, []);

  const showNotification = (type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className="notification-system">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// Export function to show notifications from anywhere
export const showNotification = (type, title, message, duration) => {
  const event = new CustomEvent('showNotification', {
    detail: { type, title, message, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;