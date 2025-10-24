import React from 'react';
import './BusinessIntelligence.css';

const BusinessIntelligence = ({ insights, onInsightSelect }) => {
  return (
    <div className="business-intelligence">
      <h4>Business Intelligence</h4>
      <div className="insights-grid">
        {insights?.map(insight => (
          <div 
            key={insight.id} 
            className="insight-card"
            onClick={() => onInsightSelect(insight)}
          >
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <div className="insight-title">{insight.title}</div>
              <div className="insight-metric">{insight.metric}</div>
              <div className="insight-trend">
                <span className={`trend ${insight.trend}`}>
                  {insight.trend === 'positive' ? '↑' : '↓'} {insight.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessIntelligence;