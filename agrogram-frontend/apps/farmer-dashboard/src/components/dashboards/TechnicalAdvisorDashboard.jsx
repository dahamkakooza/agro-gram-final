// src/components/dashboards/agent/TechnicalAdvisorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, CaseManager, KnowledgeBase } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import { dashboardAPI } from '../../services/services';
import './TechnicalAdvisorDashboard.css';

const TechnicalAdvisorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await dashboardAPI.getTechnicalAdvisorDashboard();
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('TECHNICAL_ADVISOR');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('TECHNICAL_ADVISOR');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const {
    handleNewCase,
    handlePrioritySort,
    handleImageAnalysis,
    handlePrepareVisit,
    handleResearch,
    handleStudyResearch,
    handleAccessTraining,
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
    <div className="dashboard technical-advisor-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🔧 Technical Advisor Dashboard</h1>
          <p>Agricultural advisory services with case management and knowledge integration</p>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary"
            onClick={handleNewCase}
          >
            New Case
          </Button>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="cases-card full-width">
          <div className="card-header">
            <h3>📋 Active Advisory Cases</h3>
            <Button 
              size="small"
              onClick={handlePrioritySort}
            >
              Priority Sort
            </Button>
          </div>
          <CaseManager 
            cases={dashboardData?.active_cases || []}
            onCaseSelect={setSelectedCase}
          />
          <div className="case-summary">
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.total_cases || 0}</div>
              <div className="metric-label">Total Cases</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.high_priority || 0}</div>
              <div className="metric-label">High Priority</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.awaiting_response || 0}</div>
              <div className="metric-label">Awaiting Response</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.resolved_today || 0}</div>
              <div className="metric-label">Resolved Today</div>
            </div>
          </div>
        </Card>

        <Card className="tools-card">
          <div className="card-header">
            <h3>🛠️ Case Management Tools</h3>
          </div>
          <div className="remote-diagnosis">
            <h4>Remote Diagnosis</h4>
            <div className="diagnosis-tools">
              <Button 
                size="small" 
                variant="outline" 
                fullWidth
                onClick={handleImageAnalysis}
              >
                📷 Image Analysis
              </Button>
              <Button 
                size="small" 
                variant="outline" 
                fullWidth
                onClick={() => handleNavigate('/diagnosis/crop-scanner')}
              >
                🌱 Crop Health Scanner
              </Button>
              <Button 
                size="small" 
                variant="outline" 
                fullWidth
                onClick={() => handleNavigate('/diagnosis/pest-identifier')}
              >
                🐛 Pest Identifier
              </Button>
              <Button 
                size="small" 
                variant="outline" 
                fullWidth
                onClick={() => handleNavigate('/diagnosis/weather-impact')}
              >
                🌦️ Weather Impact Analysis
              </Button>
            </div>
          </div>
          <div className="field-visit-coordination">
            <h4>Field Visit Coordination</h4>
            {dashboardData?.scheduled_visits?.map(visit => (
              <div key={visit.id} className="visit-item">
                <div className="visit-date">{visit.date}</div>
                <div className="visit-farmer">{visit.farmer_name}</div>
                <div className="visit-purpose">{visit.purpose}</div>
                <Button 
                  size="small"
                  onClick={() => handlePrepareVisit(visit.id)}
                >
                  Prepare
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="knowledge-card">
          <div className="card-header">
            <h3>📚 Knowledge Base</h3>
            <Button 
              size="small"
              onClick={handleResearch}
            >
              Search
            </Button>
          </div>
          <KnowledgeBase 
            solutions={dashboardData?.knowledge_base || []}
            onSolutionSelect={(solution) => console.log('Selected solution:', solution)}
          />
          <div className="recent-solutions">
            <h4>Recently Used Solutions</h4>
            {dashboardData?.recent_solutions?.map(solution => (
              <div key={solution.id} className="solution-item">
                <div className="solution-title">{solution.title}</div>
                <div className="solution-category">{solution.category}</div>
                <div className="solution-effectiveness">{solution.effectiveness}% effective</div>
              </div>
            ))}
          </div>
          <div className="best-practices">
            <h4>Best Practices</h4>
            {dashboardData?.best_practices?.map(practice => (
              <div key={practice.id} className="practice-item">
                <div className="practice-name">{practice.name}</div>
                <div className="practice-adoption">{practice.adoption_rate}% adoption</div>
                <Button 
                  size="small"
                  onClick={() => handleNavigate(`/practices/${practice.id}`)}
                >
                  Apply
                </Button>
              </div>
            ))}
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

        <Card className="impact-card">
          <div className="card-header">
            <h3>📈 Impact Measurement</h3>
          </div>
          <div className="yield-improvement">
            <h4>Yield Improvement Tracking</h4>
            {dashboardData?.yield_improvements?.map(improvement => (
              <div key={improvement.farmer_id} className="improvement-item">
                <div className="farmer-name">{improvement.farmer_name}</div>
                <div className="crop-type">{improvement.crop}</div>
                <div className="improvement-metric">
                  <span className="before">{improvement.before_yield}t/ha</span>
                  <span className="arrow">→</span>
                  <span className="after">{improvement.after_yield}t/ha</span>
                </div>
                <div className="improvement-percent">+{improvement.improvement}%</div>
              </div>
            ))}
          </div>
          <div className="cost-reduction">
            <h4>Cost Reduction Tracking</h4>
            <div className="cost-metrics">
              <div className="cost-metric">
                <div className="metric-value">${dashboardData?.cost_reduction?.total_savings?.toLocaleString()}</div>
                <div className="metric-label">Total Savings</div>
              </div>
              <div className="cost-metric">
                <div className="metric-value">{dashboardData?.cost_reduction?.farmers_impacted}</div>
                <div className="metric-label">Farmers Impacted</div>
              </div>
              <div className="cost-metric">
                <div className="metric-value">{dashboardData?.cost_reduction?.avg_reduction}%</div>
                <div className="metric-label">Avg. Cost Reduction</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="learning-card">
          <div className="card-header">
            <h3>🎓 Continuous Learning</h3>
            <Button 
              size="small"
              onClick={handleResearch}
            >
              Research
            </Button>
          </div>
          <div className="research-integration">
            <h4>Latest Research</h4>
            {dashboardData?.latest_research?.map(research => (
              <div key={research.id} className="research-item">
                <div className="research-title">{research.title}</div>
                <div className="research-source">{research.source}</div>
                <div className="research-date">{research.publication_date}</div>
                <Button 
                  size="small"
                  onClick={() => handleStudyResearch(research.id)}
                >
                  Study
                </Button>
              </div>
            ))}
          </div>
          <div className="training-materials">
            <h4>Training Materials</h4>
            {dashboardData?.training_materials?.map(material => (
              <div key={material.id} className="material-item">
                <div className="material-type">{material.type}</div>
                <div className="material-title">{material.title}</div>
                <div className="material-duration">{material.duration}</div>
                <Button 
                  size="small"
                  onClick={() => handleAccessTraining(material.id)}
                >
                  Access
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="performance-card">
          <div className="card-header">
            <h3>📊 Advisory Performance</h3>
          </div>
          <div className="performance-metrics">
            <div className="performance-metric">
              <div className="metric-value">{dashboardData?.advisory_performance?.success_rate}%</div>
              <div className="metric-label">Success Rate</div>
            </div>
            <div className="performance-metric">
              <div className="metric-value">{dashboardData?.advisory_performance?.avg_response_time}h</div>
              <div className="metric-label">Avg. Response Time</div>
            </div>
            <div className="performance-metric">
              <div className="metric-value">{dashboardData?.advisory_performance?.farmer_satisfaction}%</div>
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

export default TechnicalAdvisorDashboard;