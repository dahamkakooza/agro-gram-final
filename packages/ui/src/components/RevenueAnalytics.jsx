import React from 'react';
import './RevenueAnalytics.css';

const RevenueAnalytics = ({ revenueData, timeRange }) => {
  return (
    <div className="revenue-analytics">
      <h4>Revenue Analytics ({timeRange})</h4>
      <div className="revenue-metrics">
        <div className="metric-card">
          <div className="metric-value">${revenueData?.total_revenue?.toLocaleString()}</div>
          <div className="metric-label">Total Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{revenueData?.growth_rate}%</div>
          <div className="metric-label">Growth Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">${revenueData?.avg_transaction?.toLocaleString()}</div>
          <div className="metric-label">Avg Transaction</div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;