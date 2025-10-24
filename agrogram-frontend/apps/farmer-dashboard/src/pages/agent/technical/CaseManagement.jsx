import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Tabs } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './CaseManagement.css';

const CaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getTechnicalAdvisorDashboard();
      if (response.success) {
        setCases(response.data.active_cases || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'blue', label: 'Open' },
      in_progress: { color: 'yellow', label: 'In Progress' },
      resolved: { color: 'green', label: 'Resolved' },
      pending: { color: 'orange', label: 'Pending' }
    };
    const config = statusConfig[status] || { color: 'gray', label: status };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const filteredCases = cases.filter(caseItem => {
    if (activeTab === 'all') return true;
    return caseItem.status === activeTab;
  });

  return (
    <div className="case-management-page">
      <div className="page-header">
        <h1>📋 Case Management</h1>
        <Button variant="primary">New Case</Button>
      </div>

      <Card>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { value: 'all', label: 'All Cases' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'pending', label: 'Pending' },
            { value: 'resolved', label: 'Resolved' }
          ]}
        />

        <Table
          columns={[
            { key: 'case_id', label: 'Case ID' },
            { key: 'farmer_name', label: 'Farmer' },
            { key: 'issue_type', label: 'Issue Type' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
            { key: 'created_date', label: 'Created' },
            { key: 'actions', label: 'Actions' }
          ]}
          data={filteredCases.map(caseItem => ({
            ...caseItem,
            priority: getPriorityBadge(caseItem.priority),
            status: getStatusBadge(caseItem.status),
            actions: (
              <div className="action-buttons">
                <Button 
                  size="small" 
                  onClick={() => setSelectedCase(caseItem)}
                >
                  View
                </Button>
                <Button 
                  size="small" 
                  variant="outline"
                  onClick={() => console.log('Assign case:', caseItem.id)}
                >
                  Assign
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
        title={`Case #${selectedCase?.case_id}`}
        size="large"
      >
        {selectedCase && (
          <div className="case-details">
            <div className="case-header">
              <div className="case-info">
                <h3>{selectedCase.issue_type}</h3>
                <p><strong>Farmer:</strong> {selectedCase.farmer_name}</p>
                <p><strong>Priority:</strong> {getPriorityBadge(selectedCase.priority)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedCase.status)}</p>
              </div>
            </div>

            <div className="case-content">
              <div className="description-section">
                <h4>Issue Description</h4>
                <p>{selectedCase.description}</p>
              </div>

              <div className="actions-section">
                <h4>Recommended Actions</h4>
                <div className="action-buttons-grid">
                  <Button variant="primary">Start Diagnosis</Button>
                  <Button variant="outline">Schedule Visit</Button>
                  <Button variant="outline">Request Images</Button>
                  <Button variant="outline">Consult Expert</Button>
                </div>
              </div>

              <div className="timeline-section">
                <h4>Case Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">{selectedCase.created_date}</div>
                    <div className="timeline-content">Case opened</div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">2024-01-16</div>
                    <div className="timeline-content">Initial assessment completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseManagement;