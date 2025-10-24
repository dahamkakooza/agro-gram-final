import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './ImpactAnalytics.css';

const ImpactAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="impact-analytics-page">
      <div className="page-header">
        <h1>📈 Impact Analytics</h1>
        <div className="header-controls">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: '3m', label: '3 Months' },
              { value: '6m', label: '6 Months' },
              { value: '1y', label: '1 Year' },
              { value: '2y', label: '2 Years' }
            ]}
          />
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      <div className="analytics-grid">
        <Card className="farmer-impact">
          <h3>Farmer Success Metrics</h3>
          <div className="impact-stats">
            <div className="impact-item positive">
              <div className="impact-value">+28%</div>
              <div className="impact-label">Average Revenue Growth</div>
            </div>
            <div className="impact-item positive">
              <div className="impact-value">+15%</div>
              <div className="impact-label">Yield Improvement</div>
            </div>
            <div className="impact-item positive">
              <div className="impact-value">94%</div>
              <div className="impact-label">Farmer Satisfaction</div>
            </div>
            <div className="impact-item positive">
              <div className="impact-value">-22%</div>
              <div className="impact-label">Cost Reduction</div>
            </div>
          </div>
        </Card>

        <Card className="revenue-trends">
          <h3>Revenue Growth Trends</h3>
          <div className="chart-container">
            <Chart
              type="line"
              data={{
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                  {
                    label: 'Before Financing',
                    data: [45000, 48000, 52000, 55000],
                    borderColor: '#9ca3af',
                    borderDash: [5, 5],
                  },
                  {
                    label: 'After Financing',
                    data: [55000, 62000, 68000, 75000],
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
                scales: {
                  y: {
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: 'Revenue ($)'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="sector-impact">
          <h3>Impact by Sector</h3>
          <div className="sector-chart">
            <Chart
              type="bar"
              data={{
                labels: ['Crops', 'Livestock', 'Dairy', 'Poultry', 'Mixed'],
                datasets: [
                  {
                    label: 'Revenue Growth %',
                    data: [32, 25, 28, 35, 30],
                    backgroundColor: '#3b82f6',
                  },
                  {
                    label: 'Cost Reduction %',
                    data: [18, 22, 15, 25, 20],
                    backgroundColor: '#10b981',
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

        <Card className="success-stories">
          <h3>Success Stories</h3>
          <div className="stories-list">
            <div className="story-item">
              <div className="story-header">
                <strong>Green Valley Organic Farm</strong>
                <span className="success-badge">+45% Revenue</span>
              </div>
              <div className="story-details">
                <p>Expanded from 50 to 120 acres with equipment financing</p>
                <div className="story-metrics">
                  <span>Loan: $150,000</span>
                  <span>Term: 36 months</span>
                  <span>ROI: 220%</span>
                </div>
              </div>
            </div>
            <div className="story-item">
              <div className="story-header">
                <strong>Sunrise Dairy Cooperative</strong>
                <span className="success-badge">+60% Production</span>
              </div>
              <div className="story-details">
                <p>Modernized milking equipment and feeding systems</p>
                <div className="story-metrics">
                  <span>Loan: $200,000</span>
                  <span>Term: 48 months</span>
                  <span>ROI: 180%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="regional-impact">
          <h3>Regional Impact Analysis</h3>
          <Table
            columns={[
              { key: 'region', label: 'Region' },
              { key: 'farmers_served', label: 'Farmers Served' },
              { key: 'total_loans', label: 'Total Loans' },
              { key: 'avg_growth', label: 'Avg. Growth' },
              { key: 'success_rate', label: 'Success Rate' }
            ]}
            data={[
              {
                region: 'Midwest',
                farmers_served: 156,
                total_loans: '$4.2M',
                avg_growth: '32%',
                success_rate: '92%'
              },
              {
                region: 'Northeast',
                farmers_served: 89,
                total_loans: '$2.1M',
                avg_growth: '28%',
                success_rate: '88%'
              },
              {
                region: 'South',
                farmers_served: 134,
                total_loans: '$3.5M',
                avg_growth: '35%',
                success_rate: '94%'
              },
              {
                region: 'West',
                farmers_served: 76,
                total_loans: '$1.8M',
                avg_growth: '30%',
                success_rate: '90%'
              }
            ]}
          />
        </Card>

        <Card className="sustainability-metrics">
          <h3>Sustainability Impact</h3>
          <div className="sustainability-grid">
            <div className="metric-card">
              <div className="metric-icon">🌱</div>
              <div className="metric-value">156</div>
              <div className="metric-label">Sustainable Practices Adopted</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💧</div>
              <div className="metric-value">-35%</div>
              <div className="metric-label">Water Usage Reduction</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🌍</div>
              <div className="metric-value">-28%</div>
              <div className="metric-label">Carbon Footprint Reduction</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🔄</div>
              <div className="metric-value">89%</div>
              <div className="metric-label">Resource Efficiency Improvement</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImpactAnalytics;