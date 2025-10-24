import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, Select, DatePicker } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './MarketIntelligence.css';

const MarketIntelligence = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [timeRange, setTimeRange] = useState('1m');

  useEffect(() => {
    fetchMarketData();
  }, [selectedCommodity, timeRange]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMarketAnalystDashboard();
      if (response.success) {
        setMarketData(response.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const commodities = [
    { value: 'all', label: 'All Commodities' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'corn', label: 'Corn' },
    { value: 'soybeans', label: 'Soybeans' },
    { value: 'rice', label: 'Rice' },
    { value: 'cotton', label: 'Cotton' }
  ];

  return (
    <div className="market-intelligence-page">
      <div className="page-header">
        <h1>📊 Market Intelligence</h1>
        <div className="header-controls">
          <Select
            value={selectedCommodity}
            onChange={setSelectedCommodity}
            options={commodities}
          />
          <Select
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: '1w', label: '1 Week' },
              { value: '1m', label: '1 Month' },
              { value: '3m', label: '3 Months' },
              { value: '1y', label: '1 Year' }
            ]}
          />
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      <div className="market-grid">
        <Card className="price-trends">
          <h3>Price Trends</h3>
          <div className="chart-container">
            <Chart
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Wheat',
                    data: [240, 245, 238, 252, 260, 255],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  },
                  {
                    label: 'Corn',
                    data: [180, 185, 190, 188, 195, 200],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  },
                  {
                    label: 'Soybeans',
                    data: [420, 415, 430, 425, 440, 435],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                      text: 'Price ($/ton)'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="market-overview">
          <h3>Market Overview</h3>
          <div className="overview-stats">
            <div className="stat-item positive">
              <div className="stat-label">Wheat Price</div>
              <div className="stat-value">$255/ton</div>
              <div className="stat-change">+2.1%</div>
            </div>
            <div className="stat-item positive">
              <div className="stat-label">Corn Price</div>
              <div className="stat-value">$200/ton</div>
              <div className="stat-change">+1.5%</div>
            </div>
            <div className="stat-item negative">
              <div className="stat-label">Soybeans Price</div>
              <div className="stat-value">$435/ton</div>
              <div className="stat-change">-0.8%</div>
            </div>
            <div className="stat-item neutral">
              <div className="stat-label">Market Volatility</div>
              <div className="stat-value">Low</div>
              <div className="stat-change">Stable</div>
            </div>
          </div>
        </Card>

        <Card className="supply-demand">
          <h3>Supply & Demand Analysis</h3>
          <div className="analysis-chart">
            <Chart
              type="bar"
              data={{
                labels: ['Wheat', 'Corn', 'Soybeans', 'Rice', 'Cotton'],
                datasets: [
                  {
                    label: 'Supply',
                    data: [85, 78, 65, 72, 58],
                    backgroundColor: '#10b981',
                  },
                  {
                    label: 'Demand',
                    data: [82, 80, 68, 70, 55],
                    backgroundColor: '#3b82f6',
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

        <Card className="market-news">
          <h3>Market News & Updates</h3>
          <div className="news-list">
            <div className="news-item">
              <div className="news-title">Global Wheat Production Forecast Increased</div>
              <div className="news-date">2024-01-15</div>
              <div className="news-summary">
                USDA raises wheat production forecast due to favorable weather conditions...
              </div>
              <Button size="small">Read More</Button>
            </div>
            <div className="news-item">
              <div className="news-title">Export Restrictions Impact Corn Prices</div>
              <div className="news-date">2024-01-14</div>
              <div className="news-summary">
                New export regulations in key producing countries affecting global corn supply...
              </div>
              <Button size="small">Read More</Button>
            </div>
          </div>
        </Card>

        <Card className="regional-analysis">
          <h3>Regional Price Analysis</h3>
          <Table
            columns={[
              { key: 'region', label: 'Region' },
              { key: 'wheat', label: 'Wheat' },
              { key: 'corn', label: 'Corn' },
              { key: 'soybeans', label: 'Soybeans' },
              { key: 'trend', label: 'Trend' }
            ]}
            data={[
              {
                region: 'North America',
                wheat: '$250/ton',
                corn: '$195/ton',
                soybeans: '$430/ton',
                trend: '↑ Rising'
              },
              {
                region: 'Europe',
                wheat: '$260/ton',
                corn: '$210/ton',
                soybeans: '$445/ton',
                trend: '→ Stable'
              },
              {
                region: 'Asia',
                wheat: '$245/ton',
                corn: '$205/ton',
                soybeans: '$440/ton',
                trend: '↑ Rising'
              },
              {
                region: 'South America',
                wheat: '$240/ton',
                corn: '$190/ton',
                soybeans: '$425/ton',
                trend: '↓ Falling'
              }
            ]}
          />
        </Card>

        <Card className="predictive-insights">
          <h3>Predictive Insights</h3>
          <div className="insights-content">
            <div className="insight-item">
              <div className="insight-title">Price Forecast - Next 30 Days</div>
              <div className="insight-details">
                <p><strong>Wheat:</strong> Expected to increase 3-5%</p>
                <p><strong>Corn:</strong> Stable with slight upward trend</p>
                <p><strong>Soybeans:</strong> Potential decrease 2-3%</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-title">Market Opportunities</div>
              <div className="insight-details">
                <p>• High demand for organic wheat in European markets</p>
                <p>• Emerging markets in Asia showing increased corn imports</p>
                <p>• Premium prices for non-GMO soybeans</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketIntelligence;