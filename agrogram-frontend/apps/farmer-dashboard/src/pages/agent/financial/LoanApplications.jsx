import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './LoanApplications.css';

const LoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      if (response.success) {
        setApplications(response.data.loan_applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', label: 'Pending' },
      approved: { color: 'green', label: 'Approved' },
      rejected: { color: 'red', label: 'Rejected' },
      under_review: { color: 'blue', label: 'Under Review' }
    };
    const config = statusConfig[status.toLowerCase()] || { color: 'gray', label: status };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const handleReviewApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    // API call to update status
    console.log(`Updating application ${applicationId} to ${newStatus}`);
    // Refresh data
    fetchApplications();
  };

  return (
    <div className="loan-applications-page">
      <div className="page-header">
        <h1>📝 Loan Applications</h1>
        <Button variant="primary" onClick={() => setShowNewApplication(true)}>
          New Application
        </Button>
      </div>

      <Card>
        <Table
          columns={[
            { key: 'farmer_name', label: 'Farmer' },
            { key: 'amount', label: 'Amount' },
            { key: 'purpose', label: 'Purpose' },
            { key: 'submitted_date', label: 'Submitted' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' }
          ]}
          data={applications.map(app => ({
            ...app,
            status: getStatusBadge(app.status),
            actions: (
              <div className="action-buttons">
                <Button 
                  size="small" 
                  onClick={() => handleReviewApplication(app)}
                >
                  Review
                </Button>
                <Button 
                  size="small" 
                  variant="outline"
                  onClick={() => handleStatusUpdate(app.id, 'approved')}
                >
                  Approve
                </Button>
              </div>
            )
          }))}
        />
      </Card>

      {/* New Application Modal */}
      <Modal
        isOpen={showNewApplication}
        onClose={() => setShowNewApplication(false)}
        title="New Loan Application"
      >
        <Form
          onSubmit={(data) => {
            console.log('New application:', data);
            setShowNewApplication(false);
          }}
        >
          <Input name="farmerName" label="Farmer Name" required />
          <Input name="loanAmount" label="Loan Amount" type="number" required />
          <Select 
            name="loanPurpose" 
            label="Loan Purpose"
            options={[
              { value: 'equipment', label: 'Equipment Purchase' },
              { value: 'expansion', label: 'Farm Expansion' },
              { value: 'operating', label: 'Operating Costs' },
              { value: 'infrastructure', label: 'Infrastructure' }
            ]}
            required
          />
          <Input name="collateral" label="Collateral Description" />
          <div className="form-actions">
            <Button type="submit" variant="primary">Submit Application</Button>
            <Button type="button" onClick={() => setShowNewApplication(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Application Detail Modal */}
      <Modal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        title="Application Details"
        size="large"
      >
        {selectedApplication && (
          <div className="application-details">
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Farmer:</strong> {selectedApplication.farmer_name}
              </div>
              <div className="detail-item">
                <strong>Amount:</strong> ${selectedApplication.amount}
              </div>
              <div className="detail-item">
                <strong>Purpose:</strong> {selectedApplication.purpose}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> {getStatusBadge(selectedApplication.status)}
              </div>
              <div className="detail-item">
                <strong>Submitted:</strong> {selectedApplication.submitted_date}
              </div>
            </div>
            
            <div className="action-section">
              <h4>Application Actions</h4>
              <div className="action-buttons">
                <Button variant="success">Approve</Button>
                <Button variant="warning">Request More Info</Button>
                <Button variant="danger">Reject</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoanApplications;