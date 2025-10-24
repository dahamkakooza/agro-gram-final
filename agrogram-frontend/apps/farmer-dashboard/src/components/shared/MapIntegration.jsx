// src/components/shared/MapIntegration.jsx
import React, { useState } from 'react';
import './MapIntegration.css';

const MapIntegration = ({ 
  locations = [],
  onLocationSelect,
  height = '400px',
  interactive = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationClick = (location) => {
    if (interactive) {
      setSelectedLocation(location);
      onLocationSelect?.(location);
      showNotification('info', 'Location Selected', `Viewing details for ${location.name}`);
    }
  };

  // Mock map implementation - in real app, integrate with Google Maps or similar
  return (
    <div className="map-integration" style={{ height }}>
      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-icon">🗺️</div>
          <div className="map-message">Interactive Map</div>
          <div className="map-locations">
            {locations.map((location, index) => (
              <div
                key={location.id}
                className={`map-location ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                style={{
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index * 10)}%`
                }}
                onClick={() => handleLocationClick(location)}
              >
                <div className="location-marker">{location.icon || '📍'}</div>
                <div className="location-tooltip">
                  <strong>{location.name}</strong>
                  <br />
                  {location.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedLocation && (
        <div className="location-details">
          <h4>{selectedLocation.name}</h4>
          <p>{selectedLocation.address}</p>
          <div className="location-metrics">
            <span>Distance: {selectedLocation.distance || 'N/A'}</span>
            <span>Status: {selectedLocation.status || 'Active'}</span>
          </div>
          <button 
            className="navigate-button"
            onClick={() => showNotification('info', 'Navigation', `Opening directions to ${selectedLocation.name}`)}
          >
            Get Directions
          </button>
        </div>
      )}
    </div>
  );
};

export default MapIntegration;