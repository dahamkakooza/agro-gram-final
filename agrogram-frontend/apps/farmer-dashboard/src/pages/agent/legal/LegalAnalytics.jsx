import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './LegalAnalytics.css';

const LegalAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLegalSpecialistDashboard();
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
    <div className="legal-analytics-page">
      <div className="page-header">
        <h1>📊 Legal Analytics</h1>
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
        <Card className="case-metrics">
          <h3>Case Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">
                {analyticsData?.legal_analytics?.win_rate}%
              </div>
              <div className="metric-label">Case Win Rate</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {analyticsData?.legal_analytics?.settlement_rate}%
              </div>
              <div className="metric-label">Settlement Rate</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {analyticsData?.case_stats?.avg_resolution_time}d
              </div>
              <div className="metric-label">Avg. Resolution Time</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                ${analyticsData?.legal_analytics?.recovered_amounts?.toLocaleString()}
              </div>
              <div className="metric-label">Amounts Recovered</div>
            </div>
          </div>
        </Card>

        <Card className="case-types">
          <h3>Cases by Type</h3>
          <div className="case-type-chart">
            <Chart
              type="doughnut"
              data={{
                labels: ['Contract', 'Property', 'Employment', 'Compliance', 'Other'],
                datasets: [
                  {
                    data: [35, 25, 15, 20, 5],
                    backgroundColor: [
                      '#3b82f6',
                      '#10b981',
                      '#f59e0b',
                      '#8b5cf6',
                      '#6b7280'
                    ],
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="case-trends">
          <h3>Case Volume Trends</h3>
          <div className="trends-chart">
            <Chart
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Cases Opened',
                    data: [12, 15, 8, 18, 14, 16],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  },
                  {
                    label: 'Cases Closed',
                    data: [10, 12, 7, 15, 13, 14],
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

        <Card className="revenue-analytics">
          <h3>Revenue Analytics</h3>
          <div className="revenue-metrics">
            <div className="revenue-item">
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">$245,000</div>
              <div className="revenue-change positive">+12%</div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Avg. Case Value</div>
              <div className="revenue-value">$8,500</div>
              <div className="revenue-change positive">+5%</div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Collection Rate</div>
              <div className="revenue-value">94%</div>
              <div className="revenue-change positive">+3%</div>
            </div>
          </div>
          <div className="revenue-chart">
            <Chart
              type="bar"
              data={{
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                  {
                    label: 'Revenue',
                    data: [55000, 62000, 58000, 70000],
                    backgroundColor: '#10b981',
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="client-analytics">
          <h3>Client Analytics</h3>
          <Table
            columns={[
              { key: 'client', label: 'Client' },
              { key: 'cases', label: 'Total Cases' },
              { key: 'success_rate', label: 'Success Rate' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'satisfaction', label: 'Satisfaction' }
            ]}
            data={[
              {
                client: 'Green Valley Farms',
                cases: 8,
                success_rate: '92%',
                revenue: '$45,000',
                satisfaction: '95%'
              },
              {
                client: 'Sunrise Cooperative',
                cases: 12,
                success_rate: '88%',
                revenue: '$68,000',
                satisfaction: '92%'
              },
              {
                client: 'Johnson Organic',
                cases: 5,
                success_rate: '95%',
                revenue: '$32,000',
                satisfaction: '98%'
              },
              {
                client: 'Midwest Grain Co',
                cases: 15,
                success_rate: '85%',
                revenue: '$89,000',
                satisfaction: '90%'
              }
            ]}
          />
        </Card>

        <Card className="efficiency-metrics">
          <h3>Efficiency Metrics</h3>
          <div className="efficiency-grid">
            <div className="efficiency-item">
              <div className="metric-name">Document Processing Time</div>
              <div className="metric-value">2.3 days</div>
              <div className="metric-trend positive">-15%</div>
            </div>
            <div className="efficiency-item">
              <div className="metric-name">Client Response Time</div>
              <div className="metric-value">4.2 hours</div>
              <div className="metric-trend positive">-22%</div>
            </div>
            <div className="efficiency-item">
              <div className="metric-name">Case Research Time</div>
              <div className="metric-value">6.8 hours</div>
              <div className="metric-trend negative">+8%</div>
            </div>
            <div className="efficiency-item">
              <div className="metric-name">Template Usage Rate</div>
              <div className="metric-value">78%</div>
              <div className="metric-trend positive">+12%</div>
            </div>
          </div>
        </Card>

        <Card className="practice-areas">
          <h3>Practice Area Performance</h3>
          <div className="practice-grid">
            <div className="practice-item">
              <div className="area-name">Agricultural Contracts</div>
              <div className="area-stats">
                <span>45 cases</span>
                <span>92% success</span>
                <span>$120K revenue</span>
              </div>
            </div>
            <div className="practice-item">
              <div className="area-name">Land & Property</div>
              <div className="area-stats">
                <span>28 cases</span>
                <span>88% success</span>
                <span>$85K revenue</span>
              </div>
            </div>
            <div className="practice-item">
              <div className="area-name">Compliance</div>
              <div className="area-stats">
                <span>32 cases</span>
                <span>95% success</span>
                <span>$65K revenue</span>
              </div>
            </div>
            <div className="practice-item">
              <div className="area-name">Dispute Resolution</div>
              <div className="area-stats">
                <span>18 cases</span>
                <span>85% success</span>
                <span>$45K revenue</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="risk-analytics">
          <h3>Risk Assessment</h3>
          <div className="risk-metrics">
            <div className="risk-item low">
              <div className="risk-label">Contract Risk</div>
              <div className="risk-value">Low</div>
            </div>
            <div className="risk-item medium">
              <div className="risk-label">Compliance Risk</div>
              <div className="risk-value">Medium</div>
            </div>
            <div className="risk-item low">
              <div className="risk-label">Litigation Risk</div>
              <div className="risk-value">Low</div>
            </div>
            <div className="risk-item high">
              <div className="risk-label">Regulatory Change Risk</div>
              <div className="risk-value">High</div>
            </div>
          </div>
          <div className="risk-alerts">
            <h4>Active Risk Alerts</h4>
            <div className="alert-item">
              <div className="alert-title">Upcoming Regulatory Changes</div>
              <div className="alert-description">
                3 major regulatory updates expected in Q2 2024
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LegalAnalytics;