import React from 'react';
import './RecommendationEngine.css';

const RecommendationEngine = ({ 
  preferences = {},
  onProductSelect,
  className = '' 
}) => {
  // Mock recommendations based on preferences
  const recommendations = [
    {
      id: 1,
      name: 'Organic Tomatoes',
      price: 4.99,
      image: '🍅',
      match: 95,
      reason: 'Matches your organic preference'
    },
    {
      id: 2,
      name: 'Fresh Basil',
      price: 2.99,
      image: '🌿',
      match: 88,
      reason: 'Frequently bought with tomatoes'
    }
  ];

  return (
    <div className={`recommendation-engine ${className}`}>
      <h3>Recommended For You</h3>
      <div className="recommendations-grid">
        {recommendations.map(product => (
          <div 
            key={product.id}
            className="recommendation-card"
            onClick={() => onProductSelect && onProductSelect(product)}
          >
            <div className="product-image">{product.image}</div>
            <div className="product-details">
              <h4 className="product-name">{product.name}</h4>
              <p className="product-price">${product.price}</p>
              <div className="match-info">
                <span className="match-score">{product.match}% match</span>
                <span className="match-reason">{product.reason}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;