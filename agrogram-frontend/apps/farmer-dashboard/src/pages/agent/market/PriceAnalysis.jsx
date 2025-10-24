import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, Select, DatePicker } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './PriceAnalysis.css';

const PriceAnalysis = () => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('wheat');
  const [timeRange, setTimeRange] = useState('1m');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPriceData();
  }, [selectedCommodity, timeRange]);

  const fetchPriceData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMarketAnalystDashboard();
      if (response.success) {
        setPriceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const commodities = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'corn', label: 'Corn' },
    { value: 'soybeans', label: 'Soybeans' },
    { value: 'rice', label: 'Rice' },
    { value: 'cotton', label: 'Cotton' }
  ];

  const priceHistory = {
    wheat: [240, 245, 238, 252, 260, 255, 265, 270, 268, 275, 272, 280],
    corn: [180, 185, 190, 188, 195, 200, 205, 210, 208, 215, 212, 220],
    soybeans: [420, 415, 430, 425, 440, 435, 450, 460, 455, 470, 465, 480]
  };

  return (
    <div className="price-analysis-page">
      <div className="page-header">
        <h1>💰 Price Analysis</h1>
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
          <Button variant="primary">Export Data</Button>
        </div>
      </div>

      <div className="price-grid">
        <Card className="current-prices">
          <h3>Current Market Prices</h3>
          <div className="prices-list">
            {commodities.map(commodity => (
              <div key={commodity.value} className="price-item">
                <div className="commodity-name">{commodity.label}</div>
                <div className="price-value">
                  ${priceHistory[commodity.value]?.[priceHistory[commodity.value].length - 1]}/ton
                </div>
                <div className="price-change positive">
                  +2.5%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="price-trends">
          <h3>Price Trends - {selectedCommodity.toUpperCase()}</h3>
          <div className="trend-chart">
            <Chart
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: `${selectedCommodity} Price`,
                    data: priceHistory[selectedCommodity] || [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
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

        <Card className="volatility-analysis">
          <h3>Price Volatility Analysis</h3>
          <div className="volatility-metrics">
            <div className="volatility-item">
              <div className="metric-label">30-Day Volatility</div>
              <div className="metric-value">12.5%</div>
              <div className="metric-trend positive">Stable</div>
            </div>
            <div className="volatility-item">
              <div className="metric-label">Price Range</div>
              <div className="metric-value">$40/ton</div>
              <div className="metric-trend neutral">Normal</div>
            </div>
            <div className="volatility-item">
              <div className="metric-label">Trend Strength</div>
              <div className="metric-value">Strong</div>
              <div className="metric-trend positive">↑</div>
            </div>
          </div>
          <div className="volatility-chart">
            <Chart
              type="bar"
              data={{
                labels: commodities.map(c => c.label),
                datasets: [
                  {
                    label: 'Volatility %',
                    data: [12.5, 15.2, 18.7, 10.3, 14.8],
                    backgroundColor: '#f59e0b',
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="regional-prices">
          <h3>Regional Price Comparison</h3>
          <Table
            columns={[
              { key: 'region', label: 'Region' },
              { key: 'wheat', label: 'Wheat' },
              { key: 'corn', label: 'Corn' },
              { key: 'soybeans', label: 'Soybeans' },
              { key: 'premium', label: 'Regional Premium' }
            ]}
            data={[
              {
                region: 'Midwest',
                wheat: '$255/ton',
                corn: '$200/ton',
                soybeans: '$435/ton',
                premium: 'Base'
              },
              {
                region: 'West Coast',
                wheat: '$270/ton',
                corn: '$215/ton',
                soybeans: '$455/ton',
                premium: '+6%'
              },
              {
                region: 'Northeast',
                wheat: '$265/ton',
                corn: '$210/ton',
                soybeans: '$450/ton',
                premium: '+4%'
              },
              {
                region: 'South',
                wheat: '$250/ton',
                corn: '$195/ton',
                soybeans: '$430/ton',
                premium: '-2%'
              }
            ]}
          />
        </Card>

        <Card className="price-factors">
          <h3>Price Influencing Factors</h3>
          <div className="factors-list">
            <div className="factor-item positive">
              <div className="factor-icon">🌧️</div>
              <div className="factor-content">
                <div className="factor-title">Favorable Weather</div>
                <div className="factor-impact">Positive impact on supply</div>
              </div>
            </div>
            <div className="factor-item negative">
              <div className="factor-icon">🚢</div>
              <div className="factor-content">
                <div className="factor-title">Export Restrictions</div>
                <div className="factor-impact">Reduced international demand</div>
              </div>
            </div>
            <div className="factor-item positive">
              <div className="factor-icon">💰</div>
              <div className="factor-content">
                <div className="factor-title">Strong USD</div>
                <div className="factor-impact">Increased export competitiveness</div>
              </div>
            </div>
            <div className="factor-item negative">
              <div className="factor-icon">🛢️</div>
              <div className="factor-content">
                <div className="factor-title">High Fuel Costs</div>
                <div className="factor-impact">Increased transportation costs</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="price-forecast">
          <h3>Short-term Price Forecast</h3>
          <div className="forecast-content">
            <div className="forecast-item">
              <div className="period">Next 7 Days</div>
              <div className="prediction positive">+2-3%</div>
              <div className="confidence">85% confidence</div>
            </div>
            <div className="forecast-item">
              <div className="period">Next 30 Days</div>
              <div className="prediction positive">+5-8%</div>
              <div className="confidence">78% confidence</div>
            </div>
            <div className="forecast-item">
              <div className="period">Next 90 Days</div>
              <div className="prediction negative">-2-4%</div>
              <div className="confidence">65% confidence</div>
            </div>
          </div>
          <div className="forecast-reasons">
            <h4>Key Forecast Drivers</h4>
            <ul>
              <li>Strong export demand from Asian markets</li>
              <li>Expected favorable harvest conditions</li>
              <li>Potential trade policy changes</li>
              <li>Global economic recovery trends</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PriceAnalysis;