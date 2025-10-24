import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Switch, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './AlertSystem.css';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState({});

  useEffect(() => {
    fetchAlerts();
    fetchPreferences();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMarketAnalystDashboard();
      if (response.success) {
        setAlerts(response.data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    // Simulate fetching user preferences
    setAlertPreferences({
      price_alerts: true,
      news_alerts: true,
      competitor_alerts: false,
      report_alerts: true,
      email_notifications: true,
      push_notifications: false
    });
  };

  const getAlertTypeBadge = (type) => {
    const typeConfig = {
      price: { color: 'blue', label: 'Price Alert' },
      news: { color: 'green', label: 'News Alert' },
      competitor: { color: 'orange', label: 'Competitor Alert' },
      system: { color: 'purple', label: 'System Alert' }
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

  const handleTogglePreference = (key, value) => {
    setAlertPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    // API call to update preferences would go here
  };

  const handleCreateAlert = (alertData) => {
    const newAlert = {
      id: Math.random().toString(36).substr(2, 9),
      ...alertData,
      created_date: new Date().toISOString().split('T')[0],
      status: 'active',
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    setShowCreateAlert(false);
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  return (
    <div className="alert-system-page">
      <div className="page-header">
        <h1>🔔 Alert System</h1>
        <Button variant="primary" onClick={() => setShowCreateAlert(true)}>
          Create Alert
        </Button>
      </div>

      <div className="alert-system-grid">
        <Card className="alert-preferences">
          <h3>Alert Preferences</h3>
          <div className="preferences-list">
            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-label">Price Alerts</div>
                <div className="preference-description">
                  Get notified about significant price changes
                </div>
              </div>
              <Switch
                checked={alertPreferences.price_alerts}
                onChange={(checked) => handleTogglePreference('price_alerts', checked)}
              />
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-label">News Alerts</div>
                <div className="preference-description">
                  Important market news and updates
                </div>
              </div>
              <Switch
                checked={alertPreferences.news_alerts}
                onChange={(checked) => handleTogglePreference('news_alerts', checked)}
              />
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-label">Competitor Alerts</div>
                <div className="preference-description">
                  Competitor activity and market moves
                </div>
              </div>
              <Switch
                checked={alertPreferences.competitor_alerts}
                onChange={(checked) => handleTogglePreference('competitor_alerts', checked)}
              />
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-label">Email Notifications</div>
                <div className="preference-description">
                  Receive alerts via email
                </div>
              </div>
              <Switch
                checked={alertPreferences.email_notifications}
                onChange={(checked) => handleTogglePreference('email_notifications', checked)}
              />
            </div>
          </div>
        </Card>

        <Card className="active-alerts">
          <h3>Active Alerts</h3>
          <div className="alerts-list">
            {alerts.filter(alert => alert.status === 'active').map(alert => (
              <div key={alert.id} className={`alert-item ${alert.read ? 'read' : 'unread'}`}>
                <div className="alert-icon">
                  {alert.priority === 'high' ? '🔴' : 
                   alert.priority === 'medium' ? '🟡' : '🟢'}
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-meta">
                      {getAlertTypeBadge(alert.type)}
                      {getPriorityBadge(alert.priority)}
                    </div>
                  </div>
                  <div className="alert-description">{alert.description}</div>
                  <div className="alert-date">{alert.created_date}</div>
                </div>
                <div className="alert-actions">
                  {!alert.read && (
                    <Button 
                      size="small" 
                      onClick={() => markAsRead(alert.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button size="small" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="alert-history">
          <h3>Alert History</h3>
          <Table
            columns={[
              { key: 'title', label: 'Alert' },
              { key: 'type', label: 'Type' },
              { key: 'priority', label: 'Priority' },
              { key: 'created_date', label: 'Date' },
              { key: 'status', label: 'Status' }
            ]}
            data={alerts.map(alert => ({
              ...alert,
              type: getAlertTypeBadge(alert.type),
              priority: getPriorityBadge(alert.priority),
              status: (
                <Badge color={alert.status === 'active' ? 'green' : 'gray'}>
                  {alert.status}
                </Badge>
              )
            }))}
          />
        </Card>
      </div>

      {/* Create Alert Modal */}
      <Modal
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
        title="Create New Alert"
      >
        <Form
          onSubmit={handleCreateAlert}
        >
          <Input 
            name="title" 
            label="Alert Title" 
            placeholder="Enter alert title"
            required 
          />
          <Select 
            name="type" 
            label="Alert Type"
            options={[
              { value: 'price', label: 'Price Alert' },
              { value: 'news', label: 'News Alert' },
              { value: 'competitor', label: 'Competitor Alert' },
              { value: 'system', label: 'System Alert' }
            ]}
            required
          />
          <Select 
            name="priority" 
            label="Priority"
            options={[
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
            required
          />
          <Input 
            name="description" 
            label="Description" 
            type="textarea"
            placeholder="Enter alert description"
            required 
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Create Alert</Button>
            <Button type="button" onClick={() => setShowCreateAlert(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertSystem;