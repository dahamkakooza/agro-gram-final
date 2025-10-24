import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, ProgressBar, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './PerformanceAnalytics.css';

const PerformanceAnalytics = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMarketAnalystDashboard();
      if (response.success) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="performance-analytics-page">
      <div className="page-header">
        <h1>📈 Performance Analytics</h1>
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
          <Button variant="primary">Export Dashboard</Button>
        </div>
      </div>

      <div className="performance-grid">
        <Card className="key-metrics">
          <h3>Key Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">
                {performanceData?.market_performance?.analysis_accuracy}%
              </div>
              <div className="metric-label">Analysis Accuracy</div>
              <div className="metric-trend positive">+12%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {performanceData?.market_performance?.timely_reports}%
              </div>
              <div className="metric-label">Timely Reports</div>
              <div className="metric-trend positive">+18%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {performanceData?.market_performance?.client_satisfaction}%
              </div>
              <div className="metric-label">Client Satisfaction</div>
              <div className="metric-trend positive">+8%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">94%</div>
              <div className="metric-label">Data Quality Score</div>
              <div className="metric-trend positive">+5%</div>
            </div>
          </div>
        </Card>

        <Card className="accuracy-trends">
          <h3>Analysis Accuracy Trends</h3>
          <div className="accuracy-chart">
            <Chart
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Forecast Accuracy',
                    data: [78, 82, 85, 83, 88, 90],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  },
                  {
                    label: 'Price Prediction Accuracy',
                    data: [75, 78, 82, 80, 85, 87],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                    min: 70,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Accuracy %'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="report-performance">
          <h3>Report Performance</h3>
          <div className="report-metrics">
            <div className="report-item">
              <div className="report-name">Weekly Market Analysis</div>
              <div className="report-stats">
                <span>Downloads: 156</span>
                <span>Accuracy: 92%</span>
                <span>Satisfaction: 94%</span>
              </div>
              <ProgressBar value={92} max={100} showLabel />
            </div>
            <div className="report-item">
              <div className="report-name">Price Forecast Report</div>
              <div className="report-stats">
                <span>Downloads: 89</span>
                <span>Accuracy: 87%</span>
                <span>Satisfaction: 91%</span>
              </div>
              <ProgressBar value={87} max={100} showLabel />
            </div>
            <div className="report-item">
              <div className="report-name">Competitor Intelligence</div>
              <div className="report-stats">
                <span>Downloads: 67</span>
                <span>Accuracy: 95%</span>
                <span>Satisfaction: 96%</span>
              </div>
              <ProgressBar value={95} max={100} showLabel />
            </div>
          </div>
        </Card>

        <Card className="client-satisfaction">
          <h3>Client Satisfaction</h3>
          <div className="satisfaction-metrics">
            <div className="satisfaction-item">
              <div className="metric-label">Overall Satisfaction</div>
              <div className="metric-value">94%</div>
              <div className="satisfaction-stars">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="satisfaction-item">
              <div className="metric-label">Report Quality</div>
              <div className="metric-value">96%</div>
              <div className="satisfaction-stars">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="satisfaction-item">
              <div className="metric-label">Timeliness</div>
              <div className="metric-value">92%</div>
              <div className="satisfaction-stars">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="satisfaction-item">
              <div className="metric-label">Accuracy</div>
              <div className="metric-value">93%</div>
              <div className="satisfaction-stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          <div className="feedback-summary">
            <h4>Recent Client Feedback</h4>
            <div className="feedback-item">
              "Extremely accurate market predictions that helped us optimize our pricing strategy."
            </div>
            <div className="feedback-item">
              "Timely reports with actionable insights for our business decisions."
            </div>
          </div>
        </Card>

        <Card className="efficiency-metrics">
          <h3>Efficiency Metrics</h3>
          <div className="efficiency-grid">
            <div className="efficiency-item">
              <div className="metric-name">Report Generation Time</div>
              <div className="metric-value">2.3 min</div>
              <div className="metric-trend positive">-25%</div>
            </div>
            <div className="efficiency-item">
              <div className="metric-name">Data Processing Time</div>
              <div className="metric-value">1.8 min</div>
              <div className="metric-trend positive">-18%</div>
            </div>
            <div className="efficiency-item">
              <div className="metric-name">Analysis Time</div>
              <div className="metric-value">4.2 hours</div>
              <div className="metric-trend negative">+8%</div>
            </div>
            <div className="efficiency-item">
              <div className="metric-name">Automation Rate</div>
              <div className="metric-value">78%</div>
              <div className="metric-trend positive">+15%</div>
            </div>
          </div>
        </Card>

        <Card className="goal-tracking">
          <h3>Goal Tracking</h3>
          <div className="goals-list">
            <div className="goal-item">
              <div className="goal-name">Increase Forecast Accuracy to 95%</div>
              <ProgressBar value={90} max={100} showLabel />
              <div className="goal-deadline">Target: Q2 2024</div>
            </div>
            <div className="goal-item">
              <div className="goal-name">Reduce Report Generation Time by 30%</div>
              <ProgressBar value={75} max={100} showLabel />
              <div className="goal-deadline">Target: Q1 2024</div>
            </div>
            <div className="goal-item">
              <div className="goal-name">Achieve 96% Client Satisfaction</div>
              <ProgressBar value={94} max={100} showLabel />
              <div className="goal-deadline">Target: Ongoing</div>
            </div>
            <div className="goal-item">
              <div className="goal-name">Automate 85% of Standard Reports</div>
              <ProgressBar value={78} max={100} showLabel />
              <div className="goal-deadline">Target: Q3 2024</div>
            </div>
          </div>
        </Card>

        <Card className="comparative-analysis">
          <h3>Comparative Performance</h3>
          <Table
            columns={[
              { key: 'metric', label: 'Performance Metric' },
              { key: 'current', label: 'Current' },
              { key: 'previous', label: 'Previous' },
              { key: 'industry_avg', label: 'Industry Average' },
              { key: 'trend', label: 'Trend' }
            ]}
            data={[
              {
                metric: 'Forecast Accuracy',
                current: '90%',
                previous: '85%',
                industry_avg: '82%',
                trend: '↑ Above Average'
              },
              {
                metric: 'Report Timeliness',
                current: '96%',
                previous: '92%',
                industry_avg: '88%',
                trend: '↑ Excellent'
              },
              {
                metric: 'Client Satisfaction',
                current: '94%',
                previous: '91%',
                industry_avg: '89%',
                trend: '↑ Above Average'
              },
              {
                metric: 'Data Coverage',
                current: '98%',
                previous: '95%',
                industry_avg: '90%',
                trend: '↑ Leading'
              }
            ]}
          />
        </Card>

        <Card className="improvement-areas">
          <h3>Areas for Improvement</h3>
          <div className="improvement-list">
            <div className="improvement-item">
              <div className="area-name">Complex Market Analysis</div>
              <div className="improvement-details">
                <p>Current accuracy: 82%</p>
                <p>Target: 90% by Q2 2024</p>
                <div className="action-plan">
                  <strong>Action Plan:</strong> Enhanced data sources and machine learning models
                </div>
              </div>
            </div>
            <div className="improvement-item">
              <div className="area-name">Real-time Data Processing</div>
              <div className="improvement-details">
                <p>Current speed: 3.2 minutes</p>
                <p>Target: 2.0 minutes by Q1 2024</p>
                <div className="action-plan">
                  <strong>Action Plan:</strong> Infrastructure optimization and parallel processing
                </div>
              </div>
            </div>
            <div className="improvement-item">
              <div className="area-name">Custom Report Generation</div>
              <div className="improvement-details">
                <p>Current automation: 65%</p>
                <p>Target: 85% by Q3 2024</p>
                <div className="action-plan">
                  <strong>Action Plan:</strong> Template expansion and AI-assisted customization
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;