// src/components/shared/MetricDisplay.jsx
import React from 'react';
import './MetricDisplay.css';

const MetricDisplay = ({ metrics, layout = 'grid', size = 'medium' }) => {
  return (
    <div className={`metric-display ${layout} ${size}`}>
      {metrics.map((metric, index) => (
        <div key={index} className={`metric-card ${metric.trend || ''}`}>
          <div className="metric-header">
            <span className="metric-icon">{metric.icon}</span>
            <span className="metric-title">{metric.title}</span>
          </div>
          <div className="metric-value">{metric.value}</div>
          <div className="metric-description">{metric.description}</div>
          {metric.trend && (
            <div className="metric-trend">
              <span className={`trend-indicator ${metric.trend}`}>
                {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
              </span>
              <span className="trend-value">{metric.trendValue}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricDisplay;