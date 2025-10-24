import React from 'react';
import './RouteOptimizer.css';

const RouteOptimizer = ({ routes, onRouteSelect }) => {
  return (
    <div className="route-optimizer">
      <h4>Route Optimization</h4>
      <div className="routes-list">
        {routes?.map(route => (
          <div 
            key={route.id} 
            className="route-item"
            onClick={() => onRouteSelect(route)}
          >
            <div className="route-icon">🗺️</div>
            <div className="route-details">
              <div className="route-name">{route.name}</div>
              <div className="route-stats">
                <span>Distance: {route.distance}km</span>
                <span>Time: {route.estimated_time}</span>
                <span className={`efficiency ${route.efficiency}`}>
                  Efficiency: {route.efficiency}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteOptimizer;