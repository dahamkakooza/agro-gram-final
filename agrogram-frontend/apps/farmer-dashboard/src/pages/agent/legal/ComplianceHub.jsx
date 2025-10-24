import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './ComplianceHub.css';

const ComplianceHub = () => {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLegalSpecialistDashboard();
      if (response.success) {
        setComplianceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactLevel = (impact) => {
    const impactConfig = {
      high: { color: 'red', label: 'High Impact' },
      medium: { color: 'yellow', label: 'Medium Impact' },
      low: { color: 'green', label: 'Low Impact' }
    };
    return impactConfig[impact] || { color: 'gray', label: impact };
  };

  const handleNewUpdate = (updateData) => {
    const newUpdate = {
      id: Math.random().toString(36).substr(2, 9),
      ...updateData,
      published_date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setComplianceData(prev => ({
      ...prev,
      regulatory_updates: [newUpdate, ...(prev.regulatory_updates || [])]
    }));
    setShowUpdateForm(false);
  };

  return (
    <div className="compliance-hub-page">
      <div className="page-header">
        <h1>📜 Compliance Hub</h1>
        <Button variant="primary" onClick={() => setShowUpdateForm(true)}>
          Add Update
        </Button>
      </div>

      <div className="compliance-grid">
        <Card className="regulatory-updates">
          <h3>Regulatory Updates</h3>
          <div className="updates-list">
            {complianceData?.regulatory_updates?.map(update => (
              <div key={update.id} className="update-item">
                <div className="update-header">
                  <div className="update-title">{update.title}</div>
                  <Badge color={getImpactLevel(update.impact_level).color}>
                    {getImpactLevel(update.impact_level).label}
                  </Badge>
                </div>
                <div className="update-meta">
                  <span>Effective: {update.effective_date}</span>
                  <span>Published: {update.published_date}</span>
                </div>
                <div className="update-description">
                  {update.description}
                </div>
                <div className="update-actions">
                  <Button size="small">Read More</Button>
                  <Button size="small" variant="outline">Notify Clients</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="audit-preparation">
          <h3>Audit Preparation</h3>
          <div className="audit-checklist">
            <h4>Compliance Checklist</h4>
            {complianceData?.audit_checklist?.map(item => (
              <div key={item.id} className="checklist-item">
                <label className="checklist-label">
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={() => console.log('Toggle item:', item.id)}
                  />
                  <span className="item-name">{item.name}</span>
                </label>
                <div className="item-deadline">{item.deadline}</div>
                <Badge color={item.priority === 'high' ? 'red' : 'yellow'}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
          <div className="audit-readiness">
            <h4>Audit Readiness</h4>
            <div className="readiness-display">
              <div className="readiness-bar">
                <div 
                  className="readiness-fill"
                  style={{ width: `${complianceData?.audit_readiness || 0}%` }}
                ></div>
              </div>
              <div className="readiness-value">{complianceData?.audit_readiness || 0}%</div>
            </div>
            <div className="readiness-actions">
              <Button variant="outline">Generate Report</Button>
              <Button variant="outline">Schedule Mock Audit</Button>
            </div>
          </div>
        </Card>

        <Card className="compliance-metrics">
          <h3>Compliance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">
                {complianceData?.compliance_metrics?.regulatory_compliance}%
              </div>
              <div className="metric-label">Regulatory Compliance</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {complianceData?.compliance_metrics?.audit_success_rate}%
              </div>
              <div className="metric-label">Audit Success Rate</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {complianceData?.compliance_metrics?.dispute_prevention_rate}%
              </div>
              <div className="metric-label">Dispute Prevention</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {complianceData?.compliance_metrics?.document_compliance}%
              </div>
              <div className="metric-label">Document Compliance</div>
            </div>
          </div>
        </Card>

        <Card className="sector-compliance">
          <h3>Sector-Specific Compliance</h3>
          <div className="sector-tabs">
            <div className="sector-item active">Organic Farming</div>
            <div className="sector-item">Livestock</div>
            <div className="sector-item">Crop Production</div>
            <div className="sector-item">Export/Import</div>
          </div>
          <div className="sector-content">
            <h4>Organic Farming Compliance</h4>
            <div className="compliance-requirements">
              <div className="requirement-item">
                <div className="req-title">Soil Management</div>
                <div className="req-status compliant">Compliant</div>
              </div>
              <div className="requirement-item">
                <div className="req-title">Pest Control</div>
                <div className="req-status non-compliant">Needs Review</div>
              </div>
              <div className="requirement-item">
                <div className="req-title">Certification Maintenance</div>
                <div className="req-status compliant">Compliant</div>
              </div>
              <div className="requirement-item">
                <div className="req-title">Record Keeping</div>
                <div className="req-status pending">In Progress</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compliance-alerts">
          <h3>Compliance Alerts</h3>
          <div className="alerts-list">
            <div className="alert-item high">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <div className="alert-title">New Organic Standards Update</div>
                <div className="alert-description">
                  USDA published new organic certification requirements effective March 2024
                </div>
                <div className="alert-date">Due: 2024-02-28</div>
              </div>
              <Button size="small">Review</Button>
            </div>
            <div className="alert-item medium">
              <div className="alert-icon">ℹ️</div>
              <div className="alert-content">
                <div className="alert-title">Water Usage Reporting</div>
                <div className="alert-description">
                  Quarterly water usage reports due for farms in drought-affected regions
                </div>
                <div className="alert-date">Due: 2024-01-31</div>
              </div>
              <Button size="small">Prepare</Button>
            </div>
          </div>
        </Card>

        <Card className="training-resources">
          <h3>Compliance Training</h3>
          <div className="resources-list">
            <div className="resource-item">
              <div className="resource-type">Webinar</div>
              <div className="resource-title">Understanding New Farm Labor Laws</div>
              <div className="resource-duration">1.5 hours</div>
              <Button size="small">Register</Button>
            </div>
            <div className="resource-item">
              <div className="resource-type">Guide</div>
              <div className="resource-title">Environmental Compliance Handbook</div>
              <div className="resource-pages">45 pages</div>
              <Button size="small">Download</Button>
            </div>
            <div className="resource-item">
              <div className="resource-type">Course</div>
              <div className="resource-title">Food Safety Modernization Act</div>
              <div className="resource-duration">4 hours</div>
              <Button size="small">Enroll</Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showUpdateForm}
        onClose={() => setShowUpdateForm(false)}
        title="Add Regulatory Update"
        size="large"
      >
        <Form onSubmit={handleNewUpdate}>
          <Input 
            name="title" 
            label="Update Title" 
            placeholder="Enter regulatory update title"
            required 
          />
          <Select 
            name="impact_level" 
            label="Impact Level"
            options={[
              { value: 'high', label: 'High Impact' },
              { value: 'medium', label: 'Medium Impact' },
              { value: 'low', label: 'Low Impact' }
            ]}
            required
          />
          <Input 
            name="effective_date" 
            label="Effective Date" 
            type="date"
            required 
          />
          <Input 
            name="description" 
            label="Update Description" 
            type="textarea"
            placeholder="Describe the regulatory update and its implications"
            required 
          />
          <Input 
            name="action_required" 
            label="Required Actions" 
            type="textarea"
            placeholder="List any required actions for compliance"
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Publish Update</Button>
            <Button type="button" onClick={() => setShowUpdateForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplianceHub;