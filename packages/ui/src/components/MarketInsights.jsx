import React from 'react';
import './MarketInsights.css';

const MarketInsights = ({ insights, onInsightSelect }) => {
  return (
    <div className="market-insights">
      <h4>Market Insights</h4>
      <div className="insights-grid">
        {insights?.map(insight => (
          <div 
            key={insight.id} 
            className="insight-card"
            onClick={() => onInsightSelect(insight)}
          >
            <div className="insight-trend">
              <span className={`trend ${insight.trend}`}>
                {insight.trend === 'up' ? '📈' : '📉'}
              </span>
            </div>
            <div className="insight-content">
              <div className="insight-commodity">{insight.commodity}</div>
              <div className="insight-description">{insight.description}</div>
              <div className="insight-impact">
                Impact: <span className={`impact ${insight.impact}`}>{insight.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketInsights;