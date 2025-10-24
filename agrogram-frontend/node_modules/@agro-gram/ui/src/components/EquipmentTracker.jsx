import React, { useState } from 'react';
import './EquipmentTracker.css';

const EquipmentTracker = ({ 
  equipment = [],
  onEquipmentSelect,
  className = '' 
}) => {
  const [filter, setFilter] = useState('all');

  const filteredEquipment = equipment.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className={`equipment-tracker ${className}`}>
      <div className="equipment-header">
        <h3>Equipment Tracker</h3>
        <div className="equipment-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
            onClick={() => setFilter('maintenance')}
          >
            Maintenance
          </button>
        </div>
      </div>

      <div className="equipment-grid">
        {filteredEquipment.map(item => (
          <div 
            key={item.id}
            className={`equipment-card ${item.status}`}
            onClick={() => onEquipmentSelect && onEquipmentSelect(item)}
          >
            <div className="equipment-icon">{item.icon}</div>
            <div className="equipment-info">
              <h4 className="equipment-name">{item.name}</h4>
              <span className="equipment-id">ID: {item.id}</span>
              <span className="equipment-status">{item.status}</span>
              {item.location && (
                <span className="equipment-location">📍 {item.location}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentTracker;