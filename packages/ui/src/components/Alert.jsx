// src/components/Alert.jsx
import React from 'react';
import './Alert.css';

const Alert = ({ children, type = 'info', onClose, className = '' }) => {
  const alertClass = `alert alert-${type} ${className}`.trim();
  
  return (
    <div className={alertClass}>
      <div className="alert-content">
        {children}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;