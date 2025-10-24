import React, { useState } from 'react';
import './MaintenanceScheduler.css';

const MaintenanceScheduler = ({ 
  maintenance = [],
  onScheduleMaintenance,
  className = '' 
}) => {
  const [selectedDate, setSelectedDate] = useState('');

  const upcomingMaintenance = maintenance.filter(
    item => new Date(item.dueDate) > new Date()
  );

  return (
    <div className={`maintenance-scheduler ${className}`}>
      <h3>Maintenance Schedule</h3>
      
      <div className="schedule-maintenance">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <button 
          className="schedule-btn"
          onClick={() => onScheduleMaintenance && onScheduleMaintenance(selectedDate)}
          disabled={!selectedDate}
        >
          Schedule Maintenance
        </button>
      </div>

      <div className="upcoming-maintenance">
        <h4>Upcoming Maintenance</h4>
        {upcomingMaintenance.map(item => (
          <div key={item.id} className="maintenance-item">
            <div className="maintenance-info">
              <span className="equipment-name">{item.equipmentName}</span>
              <span className="maintenance-type">{item.type}</span>
            </div>
            <div className="maintenance-date">
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceScheduler;