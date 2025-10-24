import React, { useState, useEffect } from 'react';
import './OfflineSupport.css';

const OfflineSupport = ({ 
  children,
  onOnline,
  onOffline,
  className = '' 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOnline && onOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      onOffline && onOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  return (
    <div className={`offline-support ${className}`}>
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ You are currently offline. Some features may be limited.
        </div>
      )}
      {children}
    </div>
  );
};

export default OfflineSupport;