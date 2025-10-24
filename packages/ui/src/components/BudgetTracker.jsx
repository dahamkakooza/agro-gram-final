import React, { useState, useEffect } from 'react';
import './BudgetTracker.css';

const BudgetTracker = ({ 
  budget = {},
  spending = {},
  onBudgetUpdate,
  className = ''
}) => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [allocatedBudget, setAllocatedBudget] = useState(budget.allocated || 0);
  const [actualSpending, setActualSpending] = useState(spending.actual || 0);

  // Calculate budget metrics
  const remainingBudget = allocatedBudget - actualSpending;
  const utilizationRate = allocatedBudget > 0 ? (actualSpending / allocatedBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  // Budget categories with spending breakdown
  const categories = [
    { name: 'Produce', allocated: 15000, spent: 12000, color: '#28a745' },
    { name: 'Dairy', allocated: 8000, spent: 7500, color: '#17a2b8' },
    { name: 'Meat & Poultry', allocated: 12000, spent: 14000, color: '#dc3545' },
    { name: 'Grains', allocated: 5000, spent: 4500, color: '#ffc107' },
    { name: 'Supplies', allocated: 3000, spent: 2800, color: '#6f42c1' }
  ];

  const getBudgetStatus = () => {
    if (utilizationRate >= 95) return 'critical';
    if (utilizationRate >= 85) return 'warning';
    if (utilizationRate >= 70) return 'monitor';
    return 'healthy';
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: '#28a745',
      monitor: '#ffc107',
      warning: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: '✅',
      monitor: '⚠️',
      warning: '🔶',
      critical: '🚨'
    };
    return icons[status] || '❓';
  };

  const handleBudgetUpdate = (newBudget) => {
    setAllocatedBudget(newBudget);
    onBudgetUpdate && onBudgetUpdate({ allocated: newBudget, timeframe });
  };

  return (
    <div className={`budget-tracker ${className}`}>
      <div className="budget-header">
        <h3>Budget Tracker</h3>
        <div className="timeframe-selector">
          <button 
            className={`timeframe-btn ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'quarterly' ? 'active' : ''}`}
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="budget-overview">
        <div className="budget-metrics">
          <div className="metric-card">
            <div className="metric-label">Allocated Budget</div>
            <div className="metric-value">${allocatedBudget.toLocaleString()}</div>
            <button 
              className="edit-budget-btn"
              onClick={() => {
                const newBudget = prompt('Enter new budget amount:', allocatedBudget);
                if (newBudget && !isNaN(newBudget)) {
                  handleBudgetUpdate(parseFloat(newBudget));
                }
              }}
            >
              Edit
            </button>
          </div>

          <div className="metric-card">
            <div className="metric-label">Actual Spending</div>
            <div className="metric-value">${actualSpending.toLocaleString()}</div>
            <div className="metric-subtext">As of today</div>
          </div>

          <div className={`metric-card ${isOverBudget ? 'over-budget' : ''}`}>
            <div className="metric-label">Remaining</div>
            <div className="metric-value" style={{ color: getBudgetStatus() === 'critical' ? '#dc3545' : '#28a745' }}>
              ${Math.abs(remainingBudget).toLocaleString()}
              {isOverBudget && ' Over'}
            </div>
            <div className="metric-subtext">
              {isOverBudget ? 'Over budget' : 'Available'}
            </div>
          </div>

          <div className="metric-card status">
            <div className="metric-label">Budget Health</div>
            <div 
              className="metric-value"
              style={{ color: getStatusColor(getBudgetStatus()) }}
            >
              {getStatusIcon(getBudgetStatus())} {getBudgetStatus().toUpperCase()}
            </div>
            <div className="metric-subtext">
              {utilizationRate.toFixed(1)}% utilized
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="budget-progress">
          <div className="progress-header">
            <span>Budget Utilization</span>
            <span>{utilizationRate.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${Math.min(utilizationRate, 100)}%`,
                backgroundColor: getStatusColor(getBudgetStatus())
              }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>$0</span>
            <span>${allocatedBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h4>Category Breakdown</h4>
        <div className="categories-list">
          {categories.map(category => {
            const categoryUtilization = (category.spent / category.allocated) * 100;
            const isCategoryOver = category.spent > category.allocated;
            
            return (
              <div key={category.name} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.name}</span>
                  <span className={`category-status ${isCategoryOver ? 'over' : 'under'}`}>
                    {isCategoryOver ? 'Over' : 'Under'} Budget
                  </span>
                </div>
                
                <div className="category-progress">
                  <div 
                    className="category-progress-bar"
                    style={{ backgroundColor: category.color + '30' }}
                  >
                    <div 
                      className="category-progress-fill"
                      style={{
                        width: `${Math.min(categoryUtilization, 100)}%`,
                        backgroundColor: category.color
                      }}
                    ></div>
                  </div>
                  <span className="category-percentage">
                    {categoryUtilization.toFixed(0)}%
                  </span>
                </div>

                <div className="category-numbers">
                  <span className="category-allocated">
                    Allocated: ${category.allocated.toLocaleString()}
                  </span>
                  <span className="category-spent">
                    Spent: ${category.spent.toLocaleString()}
                  </span>
                  <span className={`category-remaining ${isCategoryOver ? 'negative' : 'positive'}`}>
                    {isCategoryOver ? 'Over: ' : 'Remaining: '}
                    ${Math.abs(category.allocated - category.spent).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="budget-alerts">
        <h4>Budget Alerts</h4>
        <div className="alerts-list">
          {categories.map(category => {
            if (category.spent > category.allocated) {
              return (
                <div key={category.name} className="alert-item critical">
                  <span className="alert-icon">🚨</span>
                  <div className="alert-content">
                    <strong>{category.name} is over budget</strong>
                    <span>By ${(category.spent - category.allocated).toLocaleString()}</span>
                  </div>
                </div>
              );
            } else if ((category.spent / category.allocated) > 0.9) {
              return (
                <div key={category.name} className="alert-item warning">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <strong>{category.name} is nearing budget limit</strong>
                    <span>{((category.spent / category.allocated) * 100).toFixed(1)}% utilized</span>
                  </div>
                </div>
              );
            }
            return null;
          }).filter(alert => alert !== null)}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="budget-summary">
        <div className="summary-item">
          <span className="summary-label">Total Categories</span>
          <span className="summary-value">{categories.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Categories Over Budget</span>
          <span className="summary-value critical">
            {categories.filter(cat => cat.spent > cat.allocated).length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Average Utilization</span>
          <span className="summary-value">
            {(categories.reduce((sum, cat) => sum + (cat.spent / cat.allocated), 0) / categories.length * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;