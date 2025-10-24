import React, { useState, useEffect } from 'react';
import { Card, Button, Table, LoadingSpinner, Chart } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1m');

  useEffect(() => {
    fetchPortfolioData();
  }, [timeRange]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      if (response.success) {
        setPortfolioData(response.data.portfolio_stats);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <h1>💰 Financial Portfolio Overview</h1>
        <div className="header-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-filter"
          >
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="1y">1 Year</option>
          </select>
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      <div className="portfolio-grid">
        <Card className="portfolio-summary">
          <h3>Portfolio Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="label">Total Loan Portfolio</span>
              <span className="value">${portfolioData?.total_loans?.toLocaleString() || '0'}</span>
            </div>
            <div className="stat-item">
              <span className="label">Active Loans</span>
              <span className="value">{portfolioData?.active_loans || 0}</span>
            </div>
            <div className="stat-item">
              <span className="label">Default Rate</span>
              <span className="value">{portfolioData?.default_rate || '0'}%</span>
            </div>
            <div className="stat-item">
              <span className="label">Recovery Rate</span>
              <span className="value">{portfolioData?.recovery_rate || '0'}%</span>
            </div>
          </div>
        </Card>

        <Card className="performance-chart">
          <h3>Portfolio Performance</h3>
          <div className="chart-container">
            <Chart
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Portfolio Value',
                    data: [450000, 520000, 480000, 610000, 580000, 650000],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card className="loan-distribution">
          <h3>Loan Distribution by Sector</h3>
          <div className="distribution-chart">
            <Chart
              type="doughnut"
              data={{
                labels: ['Crops', 'Livestock', 'Equipment', 'Infrastructure', 'Other'],
                datasets: [
                  {
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                      '#10b981',
                      '#3b82f6',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6'
                    ],
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="risk-metrics">
          <h3>Risk Metrics</h3>
          <div className="risk-grid">
            <div className="risk-item low">
              <span className="risk-label">Credit Risk</span>
              <span className="risk-value">Low</span>
            </div>
            <div className="risk-item medium">
              <span className="risk-label">Market Risk</span>
              <span className="risk-value">Medium</span>
            </div>
            <div className="risk-item low">
              <span className="risk-label">Operational Risk</span>
              <span className="risk-value">Low</span>
            </div>
            <div className="risk-item high">
              <span className="risk-label">Liquidity Risk</span>
              <span className="risk-value">High</span>
            </div>
          </div>
        </Card>

        <Card className="recent-activities">
          <h3>Recent Activities</h3>
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'activity', label: 'Activity' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' }
            ]}
            data={[
              {
                date: '2024-01-15',
                activity: 'Loan Disbursement - John Farm',
                amount: '$50,000',
                status: 'Completed'
              },
              {
                date: '2024-01-14',
                activity: 'Loan Application - Smith Ranch',
                amount: '$75,000',
                status: 'Pending'
              },
              {
                date: '2024-01-13',
                activity: 'Payment Received - Johnson Co',
                amount: '$12,500',
                status: 'Completed'
              }
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;