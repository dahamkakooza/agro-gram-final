// src/components/dashboards/agent/LegalSpecialistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, CaseTracker, DocumentManager } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import { dashboardAPI } from '../../services/services';
import './LegalSpecialistDashboard.css';

const LegalSpecialistDashboard = () => {
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
      
      const response = await dashboardAPI.getLegalSpecialistDashboard();
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('LEGAL_SPECIALIST');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('LEGAL_SPECIALIST');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const {
    handleNewCase,
    handleCaseLoad,
    handleCheckCompliance,
    handleReviewDocument,
    handleUseTemplate,
    handleFacilitateMediation,
    handlePrepareArbitration,
    handleResearch,
    handleAccessResource,
    handleStudyPrecedent,
    handleNewMediation,
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
    <div className="dashboard legal-specialist-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>⚖️ Legal Specialist Dashboard</h1>
          <p>Agricultural legal services with compliance tracking and dispute resolution</p>
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
            <h3>📋 Legal Cases Overview</h3>
            <Button 
              size="small"
              onClick={handleCaseLoad}
            >
              Case Load
            </Button>
          </div>
          <CaseTracker 
            cases={dashboardData?.legal_cases || []}
            onCaseSelect={setSelectedCase}
          />
          <div className="case-summary">
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.active_cases || 0}</div>
              <div className="metric-label">Active Cases</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.urgent_cases || 0}</div>
              <div className="metric-label">Urgent Cases</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.success_rate}%</div>
              <div className="metric-label">Success Rate</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.case_stats?.avg_resolution_time}d</div>
              <div className="metric-label">Avg. Resolution Time</div>
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

        <Card className="compliance-card">
          <div className="card-header">
            <h3>📜 Compliance Hub</h3>
            <Button 
              size="small"
              onClick={handleCheckCompliance}
            >
              Check Updates
            </Button>
          </div>
          <div className="regulatory-updates">
            <h4>Regulatory Updates</h4>
            {dashboardData?.regulatory_updates?.map(update => (
              <div key={update.id} className="update-item">
                <div className="update-title">{update.title}</div>
                <div className="update-date">{update.effective_date}</div>
                <div className="update-impact">{update.impact_level}</div>
                <Button 
                  size="small"
                  onClick={() => handleNavigate(`/compliance/updates/${update.id}`)}
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
          <div className="audit-preparation">
            <h4>Audit Preparation</h4>
            <div className="audit-checklist">
              {dashboardData?.audit_checklist?.map(item => (
                <div key={item.id} className="checklist-item">
                  <input type="checkbox" checked={item.completed} readOnly />
                  <span className="item-name">{item.name}</span>
                  <span className="item-deadline">{item.deadline}</span>
                </div>
              ))}
            </div>
            <div className="audit-readiness">
              <strong>Audit Readiness: </strong>
              <div className="readiness-bar">
                <div 
                  className="readiness-fill" 
                  style={{width: `${dashboardData?.audit_readiness || 0}%`}}
                ></div>
              </div>
              <span>{dashboardData?.audit_readiness || 0}%</span>
            </div>
          </div>
        </Card>

        <Card className="documents-card">
          <div className="card-header">
            <h3>📂 Document Management</h3>
            <Button 
              size="small"
              onClick={() => handleNavigate('/documents/templates')}
            >
              Templates
            </Button>
          </div>
          <DocumentManager 
            documents={dashboardData?.legal_documents || []}
            onDocumentSelect={(doc) => handleReviewDocument(doc.id)}
          />
          <div className="contract-templates">
            <h4>Contract Templates</h4>
            {dashboardData?.contract_templates?.map(template => (
              <div key={template.id} className="template-item">
                <div className="template-name">{template.name}</div>
                <div className="template-usage">{template.usage_count} uses</div>
                <Button 
                  size="small"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
          <div className="case-documentation">
            <h4>Case Documentation</h4>
            {dashboardData?.case_documents?.map(doc => (
              <div key={doc.id} className="case-doc-item">
                <div className="doc-case">{doc.case_name}</div>
                <div className="doc-type">{doc.type}</div>
                <div className="doc-date">{doc.created_date}</div>
                <Button 
                  size="small"
                  onClick={() => handleReviewDocument(doc.id)}
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="dispute-card">
          <div className="card-header">
            <h3>🤝 Dispute Resolution</h3>
            <Button 
              size="small"
              onClick={handleNewMediation}
            >
              New Mediation
            </Button>
          </div>
          <div className="mediation-cases">
            <h4>Active Mediation Cases</h4>
            {dashboardData?.mediation_cases?.map(mediation => (
              <div key={mediation.id} className="mediation-item">
                <div className="parties">{mediation.party_a} vs {mediation.party_b}</div>
                <div className="dispute-type">{mediation.dispute_type}</div>
                <div className="mediation-stage">{mediation.stage}</div>
                <Button 
                  size="small"
                  onClick={() => handleFacilitateMediation(mediation.id)}
                >
                  Facilitate
                </Button>
              </div>
            ))}
          </div>
          <div className="arbitration-cases">
            <h4>Arbitration Cases</h4>
            {dashboardData?.arbitration_cases?.map(arbitration => (
              <div key={arbitration.id} className="arbitration-item">
                <div className="case-id">#{arbitration.id}</div>
                <div className="arbitration-status">{arbitration.status}</div>
                <div className="next-hearing">{arbitration.next_hearing}</div>
                <Button 
                  size="small"
                  onClick={() => handlePrepareArbitration(arbitration.id)}
                >
                  Prepare
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="resources-card">
          <div className="card-header">
            <h3>📚 Legal Resources</h3>
            <Button 
              size="small"
              onClick={handleResearch}
            >
              Research
            </Button>
          </div>
          <div className="agricultural-law-library">
            <h4>Agricultural Law Library</h4>
            {dashboardData?.law_library?.map(resource => (
              <div key={resource.id} className="resource-item">
                <div className="resource-title">{resource.title}</div>
                <div className="resource-category">{resource.category}</div>
                <div className="resource-jurisdiction">{resource.jurisdiction}</div>
                <Button 
                  size="small"
                  onClick={() => handleAccessResource(resource.id)}
                >
                  Access
                </Button>
              </div>
            ))}
          </div>
          <div className="precedent-database">
            <h4>Precedent Database</h4>
            {dashboardData?.legal_precedents?.map(precedent => (
              <div key={precedent.id} className="precedent-item">
                <div className="precedent-case">{precedent.case_name}</div>
                <div className="precedent-outcome">{precedent.outcome}</div>
                <div className="precedent-relevance">{precedent.relevance}% relevant</div>
                <Button 
                  size="small"
                  onClick={() => handleStudyPrecedent(precedent.id)}
                >
                  Study
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="analytics-card">
          <div className="card-header">
            <h3>📊 Legal Analytics</h3>
          </div>
          <div className="case-metrics">
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.legal_analytics?.win_rate}%</div>
              <div className="metric-label">Case Win Rate</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">{dashboardData?.legal_analytics?.settlement_rate}%</div>
              <div className="metric-label">Settlement Rate</div>
            </div>
            <div className="case-metric">
              <div className="metric-value">${dashboardData?.legal_analytics?.recovered_amounts?.toLocaleString()}</div>
              <div className="metric-label">Amounts Recovered</div>
            </div>
          </div>
          <div className="compliance-metrics">
            <h4>Compliance Metrics</h4>
            <div className="compliance-stats">
              <div className="compliance-stat">
                <span>Regulatory Compliance: </span>
                <strong>{dashboardData?.compliance_metrics?.regulatory_compliance}%</strong>
              </div>
              <div className="compliance-stat">
                <span>Audit Success Rate: </span>
                <strong>{dashboardData?.compliance_metrics?.audit_success_rate}%</strong>
              </div>
              <div className="compliance-stat">
                <span>Dispute Prevention: </span>
                <strong>{dashboardData?.compliance_metrics?.dispute_prevention_rate}%</strong>
              </div>
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

export default LegalSpecialistDashboard;