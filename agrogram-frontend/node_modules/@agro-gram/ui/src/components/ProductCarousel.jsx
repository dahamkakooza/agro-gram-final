import React, { useState } from 'react';
import './ProductCarousel.css';

const ProductCarousel = ({ 
  products = [],
  title = 'Featured Products',
  onProductSelect,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (products.length === 0) {
    return (
      <div className={`product-carousel empty ${className}`}>
        <h3>{title}</h3>
        <p>No products available</p>
      </div>
    );
  }

  return (
    <div className={`product-carousel ${className}`}>
      <div className="carousel-header">
        <h3>{title}</h3>
        <div className="carousel-controls">
          <button onClick={prevSlide} className="control-btn">‹</button>
          <span className="slide-indicator">
            {currentIndex + 1} / {products.length}
          </span>
          <button onClick={nextSlide} className="control-btn">›</button>
        </div>
      </div>

      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {products.map((product, index) => (
            <div 
              key={product.id}
              className="carousel-slide"
              onClick={() => onProductSelect && onProductSelect(product)}
            >
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">${product.price}</p>
                <span className="product-category">{product.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;