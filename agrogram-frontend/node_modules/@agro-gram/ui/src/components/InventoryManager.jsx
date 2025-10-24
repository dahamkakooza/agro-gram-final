import React, { useState } from 'react';
import './InventoryManager.css';

const InventoryManager = ({ 
  inventory = [],
  locations = [],
  onReorder,
  onTransfer,
  className = '' 
}) => {
  const [selectedLocation, setSelectedLocation] = useState('all');

  const filteredInventory = selectedLocation === 'all' 
    ? inventory 
    : inventory.filter(item => item.location === selectedLocation);

  return (
    <div className={`inventory-manager ${className}`}>
      <div className="manager-header">
        <h3>Inventory Manager</h3>
        <select 
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="location-filter"
        >
          <option value="all">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      <div className="inventory-table">
        <div className="table-header">
          <span>Item</span>
          <span>Location</span>
          <span>Quantity</span>
          <span>Actions</span>
        </div>
        {filteredInventory.map(item => (
          <div key={item.id} className="table-row">
            <span className="item-name">{item.name}</span>
            <span className="item-location">{item.location}</span>
            <span className={`item-quantity ${item.quantity < 10 ? 'low-stock' : ''}`}>
              {item.quantity}
            </span>
            <div className="item-actions">
              <button 
                className="action-btn transfer"
                onClick={() => onTransfer && onTransfer(item)}
              >
                Transfer
              </button>
              {item.quantity < 10 && (
                <button 
                  className="action-btn reorder"
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

export default InventoryManager;