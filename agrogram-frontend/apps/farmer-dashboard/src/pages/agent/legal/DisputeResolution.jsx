import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './DisputeResolution.css';

const DisputeResolution = () => {
  const [disputes, setDisputes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLegalSpecialistDashboard();
      if (response.success) {
        setDisputes(response.data);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisputeStatus = (status) => {
    const statusConfig = {
      open: { color: 'blue', label: 'Open' },
      in_mediation: { color: 'yellow', label: 'In Mediation' },
      in_arbitration: { color: 'orange', label: 'In Arbitration' },
      settled: { color: 'green', label: 'Settled' },
      closed: { color: 'gray', label: 'Closed' }
    };
    return statusConfig[status] || { color: 'gray', label: status };
  };

  const handleNewDispute = (disputeData) => {
    const newDispute = {
      id: Math.random().toString(36).substr(2, 9),
      ...disputeData,
      created_date: new Date().toISOString().split('T')[0],
      status: 'open'
    };
    setDisputes(prev => ({
      ...prev,
      mediation_cases: [newDispute, ...(prev.mediation_cases || [])]
    }));
    setShowNewDispute(false);
  };

  return (
    <div className="dispute-resolution-page">
      <div className="page-header">
        <h1>🤝 Dispute Resolution</h1>
        <Button variant="primary" onClick={() => setShowNewDispute(true)}>
          New Dispute Case
        </Button>
      </div>

      <div className="disputes-grid">
        <Card className="mediation-cases">
          <h3>Mediation Cases</h3>
          <div className="cases-list">
            {disputes?.mediation_cases?.map(mediation => (
              <div key={mediation.id} className="case-item">
                <div className="case-header">
                  <div className="parties">{mediation.party_a} vs {mediation.party_b}</div>
                  <Badge color={getDisputeStatus(mediation.status).color}>
                    {getDisputeStatus(mediation.status).label}
                  </Badge>
                </div>
                <div className="case-details">
                  <div className="dispute-type">{mediation.dispute_type}</div>
                  <div className="case-stage">Stage: {mediation.stage}</div>
                  <div className="next-session">Next: {mediation.next_session}</div>
                </div>
                <div className="case-actions">
                  <Button size="small">Facilitate</Button>
                  <Button size="small" variant="outline">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="arbitration-cases">
          <h3>Arbitration Cases</h3>
          <Table
            columns={[
              { key: 'case_id', label: 'Case ID' },
              { key: 'parties', label: 'Parties' },
              { key: 'dispute_type', label: 'Type' },
              { key: 'status', label: 'Status' },
              { key: 'next_hearing', label: 'Next Hearing' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={disputes?.arbitration_cases?.map(arbitration => ({
              ...arbitration,
              parties: `${arbitration.party_a} vs ${arbitration.party_b}`,
              status: getDisputeStatus(arbitration.status),
              actions: (
                <div className="action-buttons">
                  <Button size="small">Prepare</Button>
                  <Button size="small" variant="outline">Documents</Button>
                </div>
              )
            })) || []}
          />
        </Card>

        <Card className="dispute-metrics">
          <h3>Resolution Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">
                {disputes?.legal_analytics?.settlement_rate}%
              </div>
              <div className="metric-label">Settlement Rate</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {disputes?.legal_analytics?.avg_settlement_time}d
              </div>
              <div className="metric-label">Avg. Settlement Time</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {disputes?.legal_analytics?.mediation_success_rate}%
              </div>
              <div className="metric-label">Mediation Success</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                ${disputes?.legal_analytics?.recovered_amounts?.toLocaleString()}
              </div>
              <div className="metric-label">Amounts Recovered</div>
            </div>
          </div>
        </Card>

        <Card className="resolution-tools">
          <h3>Resolution Tools</h3>
          <div className="tools-grid">
            <div className="tool-item">
              <div className="tool-icon">🔄</div>
              <div className="tool-title">Virtual Mediation Room</div>
              <div className="tool-description">
                Conduct online mediation sessions with secure video conferencing
              </div>
              <Button size="small">Launch</Button>
            </div>
            <div className="tool-item">
              <div className="tool-icon">📝</div>
              <div className="tool-title">Settlement Agreement Generator</div>
              <div className="tool-description">
                Create legally binding settlement agreements quickly
              </div>
              <Button size="small">Create</Button>
            </div>
            <div className="tool-item">
              <div className="tool-icon">⚖️</div>
              <div className="tool-title">Arbitration Preparation</div>
              <div className="tool-description">
                Prepare arbitration cases with document management
              </div>
              <Button size="small">Prepare</Button>
            </div>
            <div className="tool-item">
              <div className="tool-icon">📊</div>
              <div className="tool-title">Case Analysis</div>
              <div className="tool-description">
                Analyze dispute patterns and success factors
              </div>
              <Button size="small">Analyze</Button>
            </div>
          </div>
        </Card>

        <Card className="upcoming-sessions">
          <h3>Upcoming Sessions</h3>
          <div className="sessions-list">
            <div className="session-item">
              <div className="session-type">Mediation</div>
              <div className="session-details">
                <strong>Smith vs Johnson Farm</strong>
                <span>Land Boundary Dispute</span>
                <span>2024-01-20 at 10:00 AM</span>
              </div>
              <Button size="small">Join</Button>
            </div>
            <div className="session-item">
              <div className="session-type">Arbitration</div>
              <div className="session-details">
                <strong>Green Valley vs Sunrise Co-op</strong>
                <span>Contract Breach</span>
                <span>2024-01-22 at 2:00 PM</span>
              </div>
              <Button size="small">Prepare</Button>
            </div>
          </div>
        </Card>

        <Card className="resource-library">
          <h3>Dispute Resolution Resources</h3>
          <div className="resources-list">
            <div className="resource-item">
              <div className="resource-title">Mediation Best Practices Guide</div>
              <div className="resource-type">PDF Guide</div>
              <Button size="small">Download</Button>
            </div>
            <div className="resource-item">
              <div className="resource-title">Agricultural Dispute Case Studies</div>
              <div className="resource-type">Case Collection</div>
              <Button size="small">View</Button>
            </div>
            <div className="resource-item">
              <div className="resource-title">Settlement Agreement Templates</div>
              <div className="resource-type">Template Pack</div>
              <Button size="small">Access</Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showNewDispute}
        onClose={() => setShowNewDispute(false)}
        title="New Dispute Case"
        size="large"
      >
        <Form onSubmit={handleNewDispute}>
          <Input 
            name="party_a" 
            label="First Party" 
            placeholder="Enter first party name"
            required 
          />
          <Input 
            name="party_b" 
            label="Second Party" 
            placeholder="Enter second party name"
            required 
          />
          <Select 
            name="dispute_type" 
            label="Dispute Type"
            options={[
              { value: 'land_boundary', label: 'Land Boundary' },
              { value: 'water_rights', label: 'Water Rights' },
              { value: 'contract_breach', label: 'Contract Breach' },
              { value: 'property_damage', label: 'Property Damage' },
              { value: 'neighbor_dispute', label: 'Neighbor Dispute' },
              { value: 'business_partnership', label: 'Business Partnership' }
            ]}
            required
          />
          <Select 
            name="resolution_type" 
            label="Resolution Type"
            options={[
              { value: 'mediation', label: 'Mediation' },
              { value: 'arbitration', label: 'Arbitration' }
            ]}
            required
          />
          <Input 
            name="description" 
            label="Case Description" 
            type="textarea"
            placeholder="Describe the dispute and issues involved"
            required 
          />
          <Input 
            name="disputed_amount" 
            label="Disputed Amount (if any)" 
            type="number"
            placeholder="Enter amount in dollars"
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Create Case</Button>
            <Button type="button" onClick={() => setShowNewDispute(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DisputeResolution;