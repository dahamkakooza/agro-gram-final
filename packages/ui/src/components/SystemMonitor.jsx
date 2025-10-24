import React from 'react';
import './SystemMonitor.css';

const SystemMonitor = ({ systems, onSystemAlert }) => {
  return (
    <div className="system-monitor">
      <h4>System Health</h4>
      <div className="systems-grid">
        {systems?.map(system => (
          <div key={system.id} className={`system-card ${system.status}`}>
            <div className="system-icon">{system.icon}</div>
            <div className="system-info">
              <div className="system-name">{system.name}</div>
              <div className="system-status">{system.status}</div>
              <div className="system-metrics">
                <span>Uptime: {system.uptime}%</span>
                <span>Response: {system.response_time}ms</span>
              </div>
            </div>
            <div className="system-actions">
              <button 
                className="alert-btn"
                onClick={() => onSystemAlert(system)}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemMonitor;