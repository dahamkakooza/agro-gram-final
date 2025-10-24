import React from 'react';
import './PortfolioManager.css';

const PortfolioManager = ({ portfolio, onClientSelect }) => {
  return (
    <div className="portfolio-manager">
      <h4>Financial Portfolio</h4>
      <div className="portfolio-grid">
        {portfolio?.clients?.map(client => (
          <div 
            key={client.id} 
            className="client-card"
            onClick={() => onClientSelect(client)}
          >
            <div className="client-header">
              <div className="client-name">{client.name}</div>
              <div className={`risk-level ${client.risk_level}`}>
                {client.risk_level}
              </div>
            </div>
            <div className="portfolio-value">
              ${client.portfolio_value?.toLocaleString()}
            </div>
            <div className="performance">
              <span className={`return ${client.return >= 0 ? 'positive' : 'negative'}`}>
                {client.return >= 0 ? '+' : ''}{client.return}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioManager;