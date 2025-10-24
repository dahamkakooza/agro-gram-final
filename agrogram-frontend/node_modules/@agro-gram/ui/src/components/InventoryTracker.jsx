import React, { useState } from 'react';
import './InventoryTracker.css';

const InventoryTracker = ({ 
  inventory = [], 
  lowStockThreshold = 10,
  onReorder,
  className = '' 
}) => {
  const [filter, setFilter] = useState('all');

  const filteredInventory = inventory.filter(item => {
    if (filter === 'low') return item.quantity <= lowStockThreshold;
    if (filter === 'out') return item.quantity === 0;
    return true;
  });

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className={`inventory-tracker ${className}`}>
      <div className="inventory-header">
        <h3>Inventory Tracker</h3>
        <div className="inventory-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({inventory.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low Stock ({inventory.filter(item => item.quantity <= lowStockThreshold).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'out' ? 'active' : ''}`}
            onClick={() => setFilter('out')}
          >
            Out of Stock ({inventory.filter(item => item.quantity === 0).length})
          </button>
        </div>
      </div>

      <div className="inventory-list">
        {filteredInventory.map(item => (
          <div key={item.id} className={`inventory-item ${getStockStatus(item.quantity)}`}>
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-sku">SKU: {item.sku}</span>
            </div>
            <div className="item-quantity">
              <span className="quantity">{item.quantity}</span>
              <span className="unit">{item.unit}</span>
            </div>
            <div className="item-actions">
              {item.quantity <= lowStockThreshold && (
                <button 
                  className="reorder-btn"
                  onClick={() => onReorder && onReorder(item)}
                >
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryTracker;