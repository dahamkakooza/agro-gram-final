import React from 'react';
import './PriceIntelligence.css';

const PriceIntelligence = ({ prices, onPriceAlert }) => {
  return (
    <div className="price-intelligence">
      <h4>Price Intelligence</h4>
      <div className="prices-table">
        {prices?.map(price => (
          <div key={price.commodity} className="price-row">
            <div className="commodity">{price.commodity}</div>
            <div className="current-price">${price.current_price}</div>
            <div className="change">
              <span className={`change-amount ${price.change >= 0 ? 'positive' : 'negative'}`}>
                {price.change >= 0 ? '+' : ''}{price.change}%
              </span>
            </div>
            <div className="trend">
              <span className={`trend ${price.trend}`}>
                {price.trend === 'up' ? '↑' : price.trend === 'down' ? '↓' : '→'}
              </span>
            </div>
            <button 
              className="alert-btn"
              onClick={() => onPriceAlert(price)}
            >
              Alert
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceIntelligence;