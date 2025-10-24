import React from 'react';
import './FleetTracker.css';

const FleetTracker = ({ vehicles, onVehicleSelect }) => {
  return (
    <div className="fleet-tracker">
      <h4>Fleet Overview</h4>
      <div className="vehicles-grid">
        {vehicles?.map(vehicle => (
          <div 
            key={vehicle.id} 
            className={`vehicle-card ${vehicle.status}`}
            onClick={() => onVehicleSelect(vehicle)}
          >
            <div className="vehicle-icon">🚚</div>
            <div className="vehicle-info">
              <div className="vehicle-name">{vehicle.name}</div>
              <div className="vehicle-details">
                <span>ID: {vehicle.id}</span>
                <span className={`status ${vehicle.status}`}>{vehicle.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetTracker;