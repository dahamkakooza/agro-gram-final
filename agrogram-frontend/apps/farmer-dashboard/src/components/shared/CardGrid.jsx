// src/components/shared/CardGrid.jsx
import React from 'react';
import './CardGrid.css';

const CardGrid = ({ 
  items, 
  columns = 3,
  renderItem,
  emptyMessage = "No items to display",
  className = ""
}) => {
  return (
    <div className={`card-grid ${className}`} style={{ '--columns': columns }}>
      {items.length > 0 ? (
        items.map((item, index) => (
          <div key={item.id || index} className="card-grid-item">
            {renderItem(item)}
          </div>
        ))
      ) : (
        <div className="card-grid-empty">
          <div className="empty-icon">📄</div>
          <div className="empty-message">{emptyMessage}</div>
        </div>
      )}
    </div>
  );
};

export default CardGrid;