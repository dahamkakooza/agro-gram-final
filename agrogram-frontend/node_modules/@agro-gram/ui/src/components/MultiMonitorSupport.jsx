import React from 'react';
import './MultiMonitorSupport.css';

const MultiMonitorSupport = ({ 
  children,
  className = '' 
}) => {
  return (
    <div className={`multi-monitor-support ${className}`}>
      {children}
    </div>
  );
};

export default MultiMonitorSupport;