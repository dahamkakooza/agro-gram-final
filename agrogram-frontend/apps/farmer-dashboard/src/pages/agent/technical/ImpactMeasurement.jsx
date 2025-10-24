import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './ImpactMeasurement.css';

const ImpactMeasurement = () => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');

  useEffect(() => {
    fetchImpactData();
  }, [timeRange]);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getTechnicalAdvisorDashboard();
      if (response.success) {
        setImpactData(response.data);
      }
    } catch (error) {
      console.error('Error fetching impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="impact-measurement-page">
      <div className="page-header">
        <h1>📊 Impact Measurement</h1>
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
          <Button variant="primary">Generate Report</Button>
        </div>
      </div>

      <div className="impact-grid">
        <Card className="yield-improvement">
          <h3>Yield Improvement Tracking</h3>
          <div className="improvement-list">
            {impactData?.yield_improvements?.map(improvement => (
              <div key={improvement.farmer_id} className="improvement-item">
                <div className="farmer-info">
                  <div className="farmer-name">{improvement.farmer_name}</div>
                  <div className="crop-type">{improvement.crop}</div>
                </div>
                <div className="improvement-metric">
                  <span className="before">{improvement.before_yield}t/ha</span>
                  <span className="arrow">→</span>
                  <span className="after">{improvement.after_yield}t/ha</span>
                </div>
                <div className="improvement-percent positive">
                  +{improvement.improvement}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="cost-reduction">
          <h3>Cost Reduction Tracking</h3>
          <div className="cost-metrics">
            <div className="cost-metric">
              <div className="metric-value">
                ${impactData?.cost_reduction?.total_savings?.toLocaleString()}
              </div>
              <div className="metric-label">Total Savings</div>
            </div>
            <div className="cost-metric">
              <div className="metric-value">
                {impactData?.cost_reduction?.farmers_impacted}
              </div>
              <div className="metric-label">Farmers Impacted</div>
            </div>
            <div className="cost-metric">
              <div className="metric-value">
                {impactData?.cost_reduction?.avg_reduction}%
              </div>
              <div className="metric-label">Avg. Cost Reduction</div>
            </div>
          </div>
          <div className="savings-breakdown">
            <h4>Savings Breakdown</h4>
            <Chart
              type="doughnut"
              data={{
                labels: ['Input Costs', 'Labor', 'Water', 'Energy', 'Other'],
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

        <Card className="advisory-performance">
          <h3>Advisory Performance</h3>
          <div className="performance-metrics">
            <div className="performance-metric">
              <div className="metric-value">
                {impactData?.advisory_performance?.success_rate}%
              </div>
              <div className="metric-label">Success Rate</div>
            </div>
            <div className="performance-metric">
              <div className="metric-value">
                {impactData?.advisory_performance?.avg_response_time}h
              </div>
              <div className="metric-label">Avg. Response Time</div>
            </div>
            <div className="performance-metric">
              <div className="metric-value">
                {impactData?.advisory_performance?.farmer_satisfaction}%
              </div>
              <div className="metric-label">Farmer Satisfaction</div>
            </div>
          </div>
          <div className="performance-trends">
            <h4>Performance Trends</h4>
            <div className="trend-item positive">
              <span>Case resolution time: </span>
              <span>-15% this quarter</span>
            </div>
            <div className="trend-item positive">
              <span>Farmer satisfaction: </span>
              <span>+8% improvement</span>
            </div>
            <div className="trend-item negative">
              <span>Complex cases: </span>
              <span>+12% increase</span>
            </div>
          </div>
        </Card>

        <Card className="sustainability-impact">
          <h3>Sustainability Impact</h3>
          <div className="sustainability-metrics">
            <div className="sustainability-metric">
              <div className="metric-icon">💧</div>
              <div className="metric-value">-35%</div>
              <div className="metric-label">Water Usage</div>
            </div>
            <div className="sustainability-metric">
              <div className="metric-icon">🌱</div>
              <div className="metric-value">+42%</div>
              <div className="metric-label">Organic Practices</div>
            </div>
            <div className="sustainability-metric">
              <div className="metric-icon">🌍</div>
              <div className="metric-value">-28%</div>
              <div className="metric-label">Carbon Footprint</div>
            </div>
            <div className="sustainability-metric">
              <div className="metric-icon">🔄</div>
              <div className="metric-value">+65%</div>
              <div className="metric-label">Resource Efficiency</div>
            </div>
          </div>
        </Card>

        <Card className="case-resolution">
          <h3>Case Resolution Analytics</h3>
          <div className="resolution-chart">
            <Chart
              type="bar"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Cases Opened',
                    data: [45, 52, 48, 61, 58, 65],
                    backgroundColor: '#3b82f6',
                  },
                  {
                    label: 'Cases Resolved',
                    data: [38, 45, 42, 55, 52, 60],
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

        <Card className="farmer-feedback">
          <h3>Farmer Feedback & Testimonials</h3>
          <div className="feedback-list">
            <div className="feedback-item">
              <div className="feedback-content">
                "The technical advice helped increase our yield by 30% while reducing water usage significantly."
              </div>
              <div className="feedback-author">
                - John Smith, Green Valley Farm
              </div>
              <div className="feedback-rating">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="feedback-item">
              <div className="feedback-content">
                "Excellent support during the pest outbreak. Quick diagnosis and effective solution saved our crops."
              </div>
              <div className="feedback-author">
                - Maria Garcia, Sunrise Orchard
              </div>
              <div className="feedback-rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImpactMeasurement;