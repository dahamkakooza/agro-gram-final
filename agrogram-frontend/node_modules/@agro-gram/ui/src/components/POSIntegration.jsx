import React, { useState } from 'react';
import './POSIntegration.css';

const POSIntegration = ({ 
  systems = [],
  onSync,
  className = '' 
}) => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!selectedSystem) return;
    
    setIsSyncing(true);
    try {
      await onSync(selectedSystem);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`pos-integration ${className}`}>
      <h4>POS Integration</h4>
      <div className="pos-systems">
        {systems.map(system => (
          <div 
            key={system.id}
            className={`pos-system ${selectedSystem?.id === system.id ? 'selected' : ''}`}
            onClick={() => setSelectedSystem(system)}
          >
            <div className="system-icon">{system.icon}</div>
            <div className="system-info">
              <span className="system-name">{system.name}</span>
              <span className="system-status">{system.connected ? 'Connected' : 'Not Connected'}</span>
            </div>
          </div>
        ))}
      </div>
      
      {selectedSystem && (
        <div className="sync-section">
          <button 
            className="sync-btn"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <span className="last-sync">
            Last sync: {selectedSystem.lastSync || 'Never'}
          </span>
        </div>
      )}
    </div>
  );
};

export default POSIntegration;