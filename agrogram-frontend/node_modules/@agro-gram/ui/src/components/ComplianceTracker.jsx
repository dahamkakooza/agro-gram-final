import React, { useState } from 'react';
import './ComplianceTracker.css';

const ComplianceTracker = ({ 
  regulations = [],
  onRegulationUpdate,
  className = '' 
}) => {
  const [filter, setFilter] = useState('all');

  const filteredRegulations = regulations.filter(regulation => {
    if (filter === 'all') return true;
    return regulation.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'non-compliant':
        return '#dc3545';
      case 'expired':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return '✅';
      case 'pending':
        return '⏳';
      case 'non-compliant':
        return '❌';
      case 'expired':
        return '📅';
      default:
        return '❓';
    }
  };

  const handleStatusUpdate = (regulationId, newStatus) => {
    onRegulationUpdate && onRegulationUpdate(regulationId, newStatus);
  };

  return (
    <div className={`compliance-tracker ${className}`}>
      <div className="compliance-header">
        <h3>Compliance Tracker</h3>
        <div className="compliance-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({regulations.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'compliant' ? 'active' : ''}`}
            onClick={() => setFilter('compliant')}
          >
            Compliant ({regulations.filter(r => r.status === 'compliant').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({regulations.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'non-compliant' ? 'active' : ''}`}
            onClick={() => setFilter('non-compliant')}
          >
            Non-Compliant ({regulations.filter(r => r.status === 'non-compliant').length})
          </button>
        </div>
      </div>

      <div className="compliance-list">
        {filteredRegulations.map(regulation => (
          <div key={regulation.id} className="compliance-item">
            <div className="regulation-info">
              <div className="regulation-header">
                <span className="regulation-name">{regulation.name}</span>
                <span 
                  className="regulation-status"
                  style={{ color: getStatusColor(regulation.status) }}
                >
                  {getStatusIcon(regulation.status)} {regulation.status}
                </span>
              </div>
              <p className="regulation-description">{regulation.description}</p>
              <div className="regulation-details">
                {regulation.country && (
                  <span className="detail">🌍 {regulation.country}</span>
                )}
                {regulation.category && (
                  <span className="detail">📁 {regulation.category}</span>
                )}
                {regulation.deadline && (
                  <span className="detail">📅 Deadline: {regulation.deadline}</span>
                )}
                {regulation.lastUpdated && (
                  <span className="detail">🔄 Updated: {regulation.lastUpdated}</span>
                )}
              </div>
            </div>
            
            <div className="regulation-actions">
              <select 
                value={regulation.status}
                onChange={(e) => handleStatusUpdate(regulation.id, e.target.value)}
                className="status-select"
                style={{ borderColor: getStatusColor(regulation.status) }}
              >
                <option value="compliant">Compliant</option>
                <option value="pending">Pending</option>
                <option value="non-compliant">Non-Compliant</option>
                <option value="expired">Expired</option>
              </select>
              
              <div className="action-buttons">
                <button className="action-btn view">View Details</button>
                {regulation.documents && regulation.documents.length > 0 && (
                  <button className="action-btn documents">
                    📎 {regulation.documents.length} Docs
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRegulations.length === 0 && (
        <div className="compliance-empty">
          <div className="empty-icon">📋</div>
          <h4>No regulations found</h4>
          <p>No compliance regulations match your current filter.</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;