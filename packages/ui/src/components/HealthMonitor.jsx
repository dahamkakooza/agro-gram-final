import React from 'react';
import './HealthMonitor.css';

const HealthMonitor = ({ 
  animals = [],
  onHealthAlert,
  className = '' 
}) => {
  const getHealthStatus = (animal) => {
    if (animal.temperature > 39.5 || animal.heartRate > 100) return 'critical';
    if (animal.temperature > 38.5 || animal.heartRate > 90) return 'warning';
    return 'healthy';
  };

  return (
    <div className={`health-monitor ${className}`}>
      <h3>Animal Health Monitor</h3>
      <div className="animals-grid">
        {animals.map(animal => (
          <div 
            key={animal.id}
            className={`animal-card ${getHealthStatus(animal)}`}
            onClick={() => onHealthAlert && onHealthAlert(animal)}
          >
            <div className="animal-header">
              <span className="animal-id">{animal.id}</span>
              <span className="health-status">{getHealthStatus(animal)}</span>
            </div>
            <div className="animal-metrics">
              <div className="metric">
                <span className="metric-label">Temp</span>
                <span className="metric-value">{animal.temperature}°C</span>
              </div>
              <div className="metric">
                <span className="metric-label">Heart Rate</span>
                <span className="metric-value">{animal.heartRate} bpm</span>
              </div>
              <div className="metric">
                <span className="metric-label">Weight</span>
                <span className="metric-value">{animal.weight} kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthMonitor;