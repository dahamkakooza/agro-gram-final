import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './AutomatedReports.css';

const AutomatedReports = () => {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMarketAnalystDashboard();
      if (response.success) {
        setReports(response.data.scheduled_reports || []);
        setTemplates(response.data.report_templates || []);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportStatus = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active' },
      paused: { color: 'yellow', label: 'Paused' },
      completed: { color: 'blue', label: 'Completed' },
      failed: { color: 'red', label: 'Failed' }
    };
    return statusConfig[status] || { color: 'gray', label: status };
  };

  const handleScheduleReport = (reportData) => {
    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      ...reportData,
      status: 'active',
      created_date: new Date().toISOString().split('T')[0],
      next_run: calculateNextRun(reportData.frequency)
    };
    setReports(prev => [newReport, ...prev]);
    setShowScheduleForm(false);
  };

  const handleCreateTemplate = (templateData) => {
    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      ...templateData,
      usage_count: 0,
      created_date: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setShowTemplateForm(false);
  };

  const calculateNextRun = (frequency) => {
    const today = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
      case 'weekly':
        return new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
      case 'monthly':
        return new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];
      default:
        return new Date().toISOString().split('T')[0];
    }
  };

  return (
    <div className="automated-reports-page">
      <div className="page-header">
        <h1>📊 Automated Reporting</h1>
        <div className="header-actions">
          <Button variant="outline" onClick={() => setShowTemplateForm(true)}>
            New Template
          </Button>
          <Button variant="primary" onClick={() => setShowScheduleForm(true)}>
            Schedule Report
          </Button>
        </div>
      </div>

      <div className="reports-grid">
        <Card className="scheduled-reports">
          <h3>Scheduled Reports</h3>
          <Table
            columns={[
              { key: 'name', label: 'Report Name' },
              { key: 'frequency', label: 'Frequency' },
              { key: 'recipients', label: 'Recipients' },
              { key: 'next_run', label: 'Next Run' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={reports.map(report => ({
              ...report,
              recipients: `${report.recipients} recipients`,
              status: <Badge color={getReportStatus(report.status).color}>{getReportStatus(report.status).label}</Badge>,
              actions: (
                <div className="action-buttons">
                  <Button size="small">Run Now</Button>
                  <Button size="small" variant="outline">Edit</Button>
                </div>
              )
            }))}
          />
        </Card>

        <Card className="report-templates">
          <h3>Report Templates</h3>
          <div className="templates-list">
            {templates.map(template => (
              <div key={template.id} className="template-item">
                <div className="template-info">
                  <div className="template-name">{template.name}</div>
                  <div className="template-type">{template.type}</div>
                  <div className="template-usage">Used {template.usage_count} times</div>
                </div>
                <div className="template-actions">
                  <Button size="small">Use Template</Button>
                  <Button size="small" variant="outline">Preview</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="report-history">
          <h3>Report History</h3>
          <div className="history-list">
            <div className="history-item">
              <div className="report-name">Weekly Market Analysis</div>
              <div className="report-date">2024-01-15</div>
              <div className="report-status completed">Completed</div>
              <Button size="small">Download</Button>
            </div>
            <div className="history-item">
              <div className="report-name">Price Forecast Report</div>
              <div className="report-date">2024-01-14</div>
              <div className="report-status completed">Completed</div>
              <Button size="small">Download</Button>
            </div>
            <div className="history-item">
              <div className="report-name">Competitor Analysis</div>
              <div className="report-date">2024-01-13</div>
              <div className="report-status failed">Failed</div>
              <Button size="small">Retry</Button>
            </div>
          </div>
        </Card>

        <Card className="delivery-stats">
          <h3>Delivery Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">156</div>
              <div className="stat-label">Reports Sent</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">94%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">45</div>
              <div className="stat-label">Active Subscribers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">2.3min</div>
              <div className="stat-label">Avg. Generation Time</div>
            </div>
          </div>
        </Card>

        <Card className="quick-reports">
          <h3>Quick Reports</h3>
          <div className="quick-actions-grid">
            <Button variant="outline" fullWidth>
              📈 Generate Market Snapshot
            </Button>
            <Button variant="outline" fullWidth>
              💰 Create Price Analysis
            </Button>
            <Button variant="outline" fullWidth>
              🏢 Competitor Summary
            </Button>
            <Button variant="outline" fullWidth>
              📊 Weekly Performance
            </Button>
            <Button variant="outline" fullWidth>
              🌍 Regional Analysis
            </Button>
            <Button variant="outline" fullWidth>
              🔮 Forecast Report
            </Button>
          </div>
        </Card>

        <Card className="report-configuration">
          <h3>Report Configuration</h3>
          <div className="config-options">
            <div className="config-item">
              <label>Default Format</label>
              <select defaultValue="pdf">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div className="config-item">
              <label>Delivery Time</label>
              <input type="time" defaultValue="08:00" />
            </div>
            <div className="config-item">
              <label>Auto-Archive Period</label>
              <select defaultValue="30">
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <Button variant="primary">Save Settings</Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showScheduleForm}
        onClose={() => setShowScheduleForm(false)}
        title="Schedule New Report"
        size="large"
      >
        <Form onSubmit={handleScheduleReport}>
          <Input 
            name="name" 
            label="Report Name" 
            placeholder="Enter report name"
            required 
          />
          <Select 
            name="template" 
            label="Report Template"
            options={templates.map(t => ({ value: t.id, label: t.name }))}
            required
          />
          <Select 
            name="frequency" 
            label="Frequency"
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' }
            ]}
            required
          />
          <Input 
            name="recipients" 
            label="Recipients" 
            placeholder="Enter email addresses (comma separated)"
            required 
          />
          <Input 
            name="parameters" 
            label="Report Parameters" 
            type="textarea"
            placeholder="Specify any custom parameters for this report"
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Schedule Report</Button>
            <Button type="button" onClick={() => setShowScheduleForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        isOpen={showTemplateForm}
        onClose={() => setShowTemplateForm(false)}
        title="Create Report Template"
        size="large"
      >
        <Form onSubmit={handleCreateTemplate}>
          <Input 
            name="name" 
            label="Template Name" 
            placeholder="Enter template name"
            required 
          />
          <Select 
            name="type" 
            label="Report Type"
            options={[
              { value: 'market_analysis', label: 'Market Analysis' },
              { value: 'price_report', label: 'Price Report' },
              { value: 'competitor_analysis', label: 'Competitor Analysis' },
              { value: 'forecast_report', label: 'Forecast Report' },
              { value: 'performance_report', label: 'Performance Report' }
            ]}
            required
          />
          <Input 
            name="description" 
            label="Template Description" 
            type="textarea"
            placeholder="Describe the purpose and content of this template"
            required 
          />
          <Input 
            name="sections" 
            label="Report Sections" 
            type="textarea"
            placeholder="List the sections to include in this report"
            required 
          />
          <Input 
            name="data_sources" 
            label="Data Sources" 
            type="textarea"
            placeholder="Specify the data sources for this report"
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Create Template</Button>
            <Button type="button" onClick={() => setShowTemplateForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AutomatedReports;