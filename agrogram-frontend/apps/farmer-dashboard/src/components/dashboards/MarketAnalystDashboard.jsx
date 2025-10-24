// src/components/dashboards/agent/MarketAnalystDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, PriceIntelligence, MarketInsights } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import { dashboardAPI } from '../../services/services';
import './MarketAnalystDashboard.css';

const MarketAnalystDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await dashboardAPI.getMarketAnalystDashboard();
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('MARKET_ANALYST');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('MARKET_ANALYST');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const {
    handleGenerateReport,
    handleRefreshData,
    handleRealTimeFeeds,
    handleRunForecast,
    handleDeepAnalysis,
    handleAnalyzeCompetitor,
    handleAutomateReport,
    handleConfigureAlerts,
    handleViewDetails,
    handleTakeAction,
    handleNavigate,
  } = useDashboardHandlers(dashboardData, fetchDashboardData, setDashboardData, setLoading);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleMessageUser = (user) => {
    console.log('Message user:', user);
  };

  const handleServiceRequest = (user, serviceType, formType) => {
    setServiceRequest({ user, serviceType, formType });
    setShowServiceForm(true);
    setShowProfileModal(false);
  };

  if (loading) {
    return <div className="dashboard-loading"><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className="dashboard market-analyst-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📈 Market Analyst Dashboard</h1>
          <p>Comprehensive market analysis and price intelligence for agricultural commodities</p>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary"
            onClick={() => handleGenerateReport('market')}
          >
            Generate Report
          </Button>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="intelligence-card full-width">
          <div className="card-header">
            <h3>🌍 Market Intelligence Overview</h3>
            <Button 
              size="small"
              onClick={handleRefreshData}
            >
              Refresh Data
            </Button>
          </div>
          <div className="commodity-selector">
            <select 
              value={selectedCommodity} 
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="commodity-filter"
            >
              <option value="all">All Commodities</option>
              {dashboardData?.commodities?.map(commodity => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
          </div>
          <div className="market-summary">
            <div className="market-metric">
              <div className="metric-value">{dashboardData?.market_stats?.tracked_commodities || 0}</div>
              <div className="metric-label">Tracked Commodities</div>
            </div>
            <div className="market-metric">
              <div className="metric-value">{dashboardData?.market_stats?.forecast_accuracy}%</div>
              <div className="metric-label">Forecast Accuracy</div>
            </div>
            <div className="market-metric">
              <div className="metric-value">{dashboardData?.market_stats?.price_alerts || 0}</div>
              <div className="metric-label">Active Price Alerts</div>
            </div>
            <div className="market-metric">
              <div className="metric-value">{dashboardData?.market_stats?.market_movements || 0}</div>
              <div className="metric-label">Significant Movements</div>
            </div>
          </div>
        </Card>

        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Professional Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Clients
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with farmers and agricultural businesses</p>
            <div className="quick-stats">
              <span>🌾 156+ Farmers</span>
              <span>🏭 45+ Businesses</span>
              <span>🤝 23+ Partners</span>
            </div>
          </div>
        </Card>

        <Card className="price-intel-card">
          <div className="card-header">
            <h3>💰 Price Intelligence</h3>
            <Button 
              size="small"
              onClick={handleRealTimeFeeds}
            >
              Real-time Feeds
            </Button>
          </div>
          <PriceIntelligence 
            prices={dashboardData?.price_intelligence || []}
            onPriceAlert={(commodity) => console.log('Price alert:', commodity)}
          />
          <div className="forecasting-models">
            <h4>Forecasting Models</h4>
            {dashboardData?.forecasting_models?.map(model => (
              <div key={model.id} className="model-item">
                <div className="model-name">{model.name}</div>
                <div className="model-accuracy">{model.accuracy}% accuracy</div>
                <div className="model-confidence">{model.confidence}</div>
                <Button 
                  size="small"
                  onClick={() => handleRunForecast(model.id)}
                >
                  Run
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="analysis-card">
          <div className="card-header">
            <h3>🔍 Market Analysis</h3>
            <Button 
              size="small"
              onClick={() => handleDeepAnalysis('market')}
            >
              Deep Analysis
            </Button>
          </div>
          <MarketInsights 
            insights={dashboardData?.market_insights || []}
            onInsightSelect={(insight) => console.log('Selected insight:', insight)}
          />
          <div className="trend-analysis">
            <h4>Trend Analysis</h4>
            {dashboardData?.market_trends?.map(trend => (
              <div key={trend.id} className="trend-item">
                <div className="trend-commodity">{trend.commodity}</div>
                <div className="trend-direction">{trend.direction}</div>
                <div className="trend-strength">{trend.strength}</div>
                <div className="trend-confidence">{trend.confidence}%</div>
                <Button 
                  size="small"
                  onClick={() => handleViewDetails(trend.id)}
                >
                  Details
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="competitor-card">
          <div className="card-header">
            <h3>🏢 Competitor Intelligence</h3>
            <Button 
              size="small"
              onClick={() => handleAnalyzeCompetitor('all')}
            >
              Analyze All
            </Button>
          </div>
          <div className="competitor-analysis">
            <h4>Competitor Analysis</h4>
            {dashboardData?.competitor_analysis?.map(competitor => (
              <div key={competitor.id} className="competitor-item">
                <div className="competitor-name">{competitor.name}</div>
                <div className="competitor-market-share">{competitor.market_share}% share</div>
                <div className="competitor-strategy">{competitor.strategy}</div>
                <div className="competitor-threat-level">{competitor.threat_level}</div>
                <Button 
                  size="small"
                  onClick={() => handleAnalyzeCompetitor(competitor.id)}
                >
                  Analyze
                </Button>
              </div>
            ))}
          </div>
          <div className="market-share-tracking">
            <h4>Market Share Tracking</h4>
            <div className="share-metrics">
              <div className="share-metric">
                <div className="metric-value">{dashboardData?.market_share?.leading_competitor}</div>
                <div className="metric-label">Market Leader</div>
              </div>
              <div className="share-metric">
                <div className="metric-value">{dashboardData?.market_share?.total_market_size}</div>
                <div className="metric-label">Market Size</div>
              </div>
              <div className="share-metric">
                <div className="metric-value">{dashboardData?.market_share?.growth_rate}%</div>
                <div className="metric-label">Growth Rate</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="reporting-card">
          <div className="card-header">
            <h3>📊 Automated Reporting</h3>
            <Button 
              size="small"
              onClick={() => handleAutomateReport('market')}
            >
              Schedule Report
            </Button>
          </div>
          <div className="scheduled-reports">
            <h4>Scheduled Reports</h4>
            {dashboardData?.scheduled_reports?.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-name">{report.name}</div>
                <div className="report-frequency">{report.frequency}</div>
                <div className="report-recipients">{report.recipients} recipients</div>
                <div className="report-next-run">{report.next_run}</div>
                <Button 
                  size="small"
                  onClick={() => handleTakeAction(report.id)}
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>
          <div className="report-templates">
            <h4>Report Templates</h4>
            {dashboardData?.report_templates?.map(template => (
              <div key={template.id} className="template-item">
                <div className="template-name">{template.name}</div>
                <div className="template-type">{template.type}</div>
                <div className="template-usage">{template.usage_count} uses</div>
                <Button 
                  size="small"
                  onClick={() => handleGenerateReport(template.id)}
                >
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="alerts-card">
          <div className="card-header">
            <h3>🚨 Alert System</h3>
            <Button 
              size="small"
              onClick={handleConfigureAlerts}
            >
              Configure Alerts
            </Button>
          </div>
          <div className="active-alerts">
            <h4>Active Alerts</h4>
            {dashboardData?.active_alerts?.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <div className="alert-commodity">{alert.commodity}</div>
                <div className="alert-type">{alert.type}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-triggered">{alert.triggered_at}</div>
                <Button 
                  size="small"
                  onClick={() => handleTakeAction(alert.id)}
                >
                  Action
                </Button>
              </div>
            ))}
          </div>
          <div className="alert-settings">
            <h4>Alert Settings</h4>
            <div className="alert-configs">
              {dashboardData?.alert_configs?.map(config => (
                <div key={config.id} className="config-item">
                  <div className="config-type">{config.type}</div>
                  <div className="config-status">{config.enabled ? 'Enabled' : 'Disabled'}</div>
                  <div className="config-threshold">{config.threshold}</div>
                  <Button 
                    size="small"
                    onClick={() => handleConfigureAlerts(config.id)}
                  >
                    Configure
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="performance-card">
          <div className="card-header">
            <h3>📈 Market Performance</h3>
          </div>
          <div className="performance-metrics">
            <div className="performance-metric">
              <div className="metric-value">{dashboardData?.market_performance?.analysis_accuracy}%</div>
              <div className="metric-label">Analysis Accuracy</div>
            </div>
            <div className="performance-metric">
              <div className="metric-value">{dashboardData?.market_performance?.timely_reports}%</div>
              <div className="metric-label">Timely Reports</div>
            </div>
            <div className="performance-metric">
              <div className="metric-value">{dashboardData?.market_performance?.client_satisfaction}%</div>
              <div className="metric-label">Client Satisfaction</div>
            </div>
          </div>
          <div className="performance-trends">
            <h4>Performance Trends</h4>
            <div className="trend-item positive">
              <span>Forecast accuracy: </span>
              <span>+12% this quarter</span>
            </div>
            <div className="trend-item positive">
              <span>Report timeliness: </span>
              <span>+18% improvement</span>
            </div>
            <div className="trend-item negative">
              <span>Market volatility: </span>
              <span>+25% increase</span>
            </div>
          </div>
        </Card>
      </div>

      {showUserDirectory && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <UserDirectory 
              currentUser={user}
              onUserSelect={handleUserSelect}
              onMessageUser={handleMessageUser}
            />
            <button 
              className="close-modal"
              onClick={() => setShowUserDirectory(false)}
            >
              Close Directory
            </button>
          </div>
        </div>
      )}

      <UserProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onMessage={handleMessageUser}
        onRequestService={handleServiceRequest}
      />

      {showServiceForm && serviceRequest && (
        <ServiceRequestForm
          targetUser={serviceRequest.user}
          serviceType={serviceRequest.serviceType}
          formType={serviceRequest.formType}
          onClose={() => setShowServiceForm(false)}
          onSubmit={(result) => {
            console.log('Service request submitted:', result);
            setShowServiceForm(false);
          }}
        />
      )}
    </div>
  );
};

export default MarketAnalystDashboard;