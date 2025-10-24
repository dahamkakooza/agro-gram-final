import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Tabs } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './LegalCases.css';

const LegalCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLegalSpecialistDashboard();
      if (response.success) {
        setCases(response.data.legal_cases || []);
      }
    } catch (error) {
      console.error('Error fetching legal cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCaseTypeBadge = (type) => {
    const typeConfig = {
      contract: { color: 'blue', label: 'Contract' },
      dispute: { color: 'orange', label: 'Dispute' },
      compliance: { color: 'purple', label: 'Compliance' },
      property: { color: 'green', label: 'Property' },
      employment: { color: 'red', label: 'Employment' }
    };
    const config = typeConfig[type] || { color: 'gray', label: type };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: 'red', label: 'High' },
      medium: { color: 'yellow', label: 'Medium' },
      low: { color: 'green', label: 'Low' }
    };
    const config = priorityConfig[priority] || { color: 'gray', label: priority };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const filteredCases = cases.filter(legalCase => {
    if (activeTab === 'all') return true;
    return legalCase.status === activeTab;
  });

  return (
    <div className="legal-cases-page">
      <div className="page-header">
        <h1>⚖️ Legal Cases</h1>
        <Button variant="primary">New Case</Button>
      </div>

      <Card>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'closed', label: 'Closed' },
            { value: 'all', label: 'All Cases' }
          ]}
        />

        <div className="case-stats">
          <div className="stat-item">
            <div className="stat-value">{cases.filter(c => c.status === 'active').length}</div>
            <div className="stat-label">Active Cases</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{cases.filter(c => c.priority === 'high').length}</div>
            <div className="stat-label">High Priority</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">85%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24d</div>
            <div className="stat-label">Avg. Resolution</div>
          </div>
        </div>

        <Table
          columns={[
            { key: 'case_number', label: 'Case #' },
            { key: 'title', label: 'Case Title' },
            { key: 'client', label: 'Client' },
            { key: 'type', label: 'Type' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
            { key: 'next_hearing', label: 'Next Hearing' },
            { key: 'actions', label: 'Actions' }
          ]}
          data={filteredCases.map(legalCase => ({
            ...legalCase,
            type: getCaseTypeBadge(legalCase.type),
            priority: getPriorityBadge(legalCase.priority),
            status: (
              <Badge color={legalCase.status === 'active' ? 'blue' : 'gray'}>
                {legalCase.status}
              </Badge>
            ),
            actions: (
              <div className="action-buttons">
                <Button 
                  size="small" 
                  onClick={() => setSelectedCase(legalCase)}
                >
                  View
                </Button>
                <Button 
                  size="small" 
                  variant="outline"
                  onClick={() => console.log('Update case:', legalCase.id)}
                >
                  Update
                </Button>
              </div>
            )
          }))}
        />
      </Card>

      {/* Case Detail Modal */}
      <Modal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        title={`Case #${selectedCase?.case_number}`}
        size="large"
      >
        {selectedCase && (
          <div className="legal-case-details">
            <div className="case-header">
              <h3>{selectedCase.title}</h3>
              <div className="case-meta">
                <div className="meta-item">
                  <strong>Client:</strong> {selectedCase.client}
                </div>
                <div className="meta-item">
                  <strong>Type:</strong> {getCaseTypeBadge(selectedCase.type)}
                </div>
                <div className="meta-item">
                  <strong>Priority:</strong> {getPriorityBadge(selectedCase.priority)}
                </div>
                <div className="meta-item">
                  <strong>Status:</strong> {selectedCase.status}
                </div>
              </div>
            </div>

            <div className="case-content">
              <div className="description-section">
                <h4>Case Description</h4>
                <p>{selectedCase.description}</p>
              </div>

              <div className="documents-section">
                <h4>Case Documents</h4>
                <div className="documents-list">
                  {selectedCase.documents?.map((doc, index) => (
                    <div key={index} className="document-item">
                      <span className="doc-name">{doc.name}</span>
                      <Button size="small">Download</Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="timeline-section">
                <h4>Case Timeline</h4>
                <div className="legal-timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">{selectedCase.filed_date}</div>
                    <div className="timeline-content">Case filed</div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">{selectedCase.next_hearing}</div>
                    <div className="timeline-content">Next hearing scheduled</div>
                  </div>
                </div>
              </div>

              <div className="action-section">
                <h4>Case Actions</h4>
                <div className="action-buttons-grid">
                  <Button variant="primary">Add Document</Button>
                  <Button variant="outline">Schedule Hearing</Button>
                  <Button variant="outline">Update Status</Button>
                  <Button variant="danger">Close Case</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalCases;