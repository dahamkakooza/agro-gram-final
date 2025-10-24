// src/components/ui/MarketPriceTicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import './MarketPriceTicker.css';

const MarketPriceTicker = ({ 
  prices = [], 
  speed = 50, 
  height = 40,
  showScrollbar = false,
  onPriceClick,
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [displayPrices, setDisplayPrices] = useState(prices);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize or update prices
  useEffect(() => {
    if (prices.length > 0) {
      setDisplayPrices(prices);
    }
  }, [prices]);

  // Auto-refresh prices
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In a real app, this would fetch new prices from an API
      console.log('Auto-refreshing market prices...');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Handle scrolling animation
  useEffect(() => {
    if (!tickerRef.current || !contentRef.current || isPaused || displayPrices.length === 0) {
      return;
    }

    const ticker = tickerRef.current;
    const content = contentRef.current;
    let animationFrameId;

    const animate = () => {
      if (ticker.scrollLeft >= content.scrollWidth - ticker.clientWidth) {
        ticker.scrollLeft = 0;
      } else {
        ticker.scrollLeft += 1;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [displayPrices, isPaused]);

  const handlePriceClick = (price) => {
    if (onPriceClick) {
      onPriceClick(price);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'var(--color-success, #28a745)';
      case 'down':
        return 'var(--color-danger, #dc3545)';
      case 'stable':
        return 'var(--color-warning, #ffc107)';
      default:
        return 'var(--color-text, #6c757d)';
    }
  };

  // If no prices, show placeholder
  if (!displayPrices || displayPrices.length === 0) {
    return (
      <div className={`market-price-ticker empty ${className}`} style={{ height: `${height}px` }}>
        <div className="ticker-content">
          <div className="price-item placeholder">
            <span>No market data available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`market-price-ticker ${className}`}>
      <div 
        ref={tickerRef}
        className="ticker-container"
        style={{ 
          height: `${height}px`,
          overflowX: showScrollbar ? 'auto' : 'hidden'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="ticker-content">
          {displayPrices.map((price, index) => (
            <div
              key={`${price.crop}-${index}`}
              className={`price-item ${onPriceClick ? 'clickable' : ''}`}
              onClick={() => handlePriceClick(price)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="crop-name">{price.crop}</span>
              <span className="price-value">${price.price}/kg</span>
              <span 
                className="price-trend"
                style={{ color: getTrendColor(price.trend) }}
              >
                {getTrendIcon(price.trend)}
                {price.change && ` ${price.change}`}
              </span>
              {price.volume && (
                <span className="volume">Vol: {price.volume}</span>
              )}
            </div>
          ))}
          
          {/* Duplicate content for seamless looping */}
          {displayPrices.map((price, index) => (
            <div
              key={`${price.crop}-dup-${index}`}
              className={`price-item duplicate ${onPriceClick ? 'clickable' : ''}`}
              onClick={() => handlePriceClick(price)}
            >
              <span className="crop-name">{price.crop}</span>
              <span className="price-value">${price.price}/kg</span>
              <span 
                className="price-trend"
                style={{ color: getTrendColor(price.trend) }}
              >
                {getTrendIcon(price.trend)}
                {price.change && ` ${price.change}`}
              </span>
              {price.volume && (
                <span className="volume">Vol: {price.volume}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="ticker-controls">
        <button
          className="control-btn"
          onClick={() => setIsPaused(!isPaused)}
          title={isPaused ? 'Resume ticker' : 'Pause ticker'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <div className="ticker-status">
          {isPaused ? 'Paused' : 'Live'}
        </div>
      </div>
    </div>
  );
};

// Default props for the component
MarketPriceTicker.defaultProps = {
  prices: [
    { crop: 'Maize', price: '0.25', trend: 'up', change: '+2%', volume: '1.2M' },
    { crop: 'Wheat', price: '0.18', trend: 'down', change: '-1%', volume: '890K' },
    { crop: 'Rice', price: '0.32', trend: 'stable', change: '0%', volume: '1.5M' },
    { crop: 'Soybeans', price: '0.28', trend: 'up', change: '+3%', volume: '750K' },
    { crop: 'Potatoes', price: '0.15', trend: 'up', change: '+5%', volume: '2.1M' },
    { crop: 'Tomatoes', price: '0.42', trend: 'down', change: '-2%', volume: '1.8M' },
  ],
  speed: 50,
  height: 40,
  showScrollbar: false,
  autoRefresh: true,
  refreshInterval: 30000
};

export default MarketPriceTicker;