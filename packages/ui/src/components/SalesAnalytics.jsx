import React from 'react';
import './SalesAnalytics.css';

const SalesAnalytics = ({ 
  salesData = {},
  trends = [],
  onInsight,
  className = '' 
}) => {
  const metrics = [
    { label: 'Total Revenue', value: `$${salesData.totalRevenue}`, change: '+12%' },
    { label: 'Units Sold', value: salesData.unitsSold, change: '+8%' },
    { label: 'Avg. Order Value', value: `$${salesData.avgOrderValue}`, change: '+5%' },
    { label: 'Conversion Rate', value: `${salesData.conversionRate}%`, change: '+2%' }
  ];

  return (
    <div className={`sales-analytics ${className}`}>
      <h3>Sales Analytics</h3>
      
      <div className="metrics-grid">
        {metrics.map(metric => (
          <div key={metric.label} className="metric-card">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
            <span className="metric-change positive">{metric.change}</span>
          </div>
        ))}
      </div>

      <div className="sales-trends">
        <h4>Recent Trends</h4>
        {trends.map(trend => (
          <div key={trend.id} className="trend-item">
            <span className="trend-description">{trend.description}</span>
            <span className={`trend-impact ${trend.impact}`}>
              {trend.impact === 'positive' ? '↑' : '↓'} {trend.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesAnalytics;