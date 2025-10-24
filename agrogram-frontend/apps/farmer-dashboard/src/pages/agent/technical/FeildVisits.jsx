import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Calendar, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './FieldVisits.css';

const FieldVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getTechnicalAdvisorDashboard();
      if (response.success) {
        setVisits(response.data.scheduled_visits || []);
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'blue', label: 'Scheduled' },
      in_progress: { color: 'yellow', label: 'In Progress' },
      completed: { color: 'green', label: 'Completed' },
      cancelled: { color: 'red', label: 'Cancelled' }
    };
    const config = statusConfig[status] || { color: 'gray', label: status };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const handleScheduleVisit = (visitData) => {
    const newVisit = {
      id: Math.random().toString(36).substr(2, 9),
      ...visitData,
      status: 'scheduled',
      created_date: new Date().toISOString().split('T')[0]
    };
    setVisits(prev => [newVisit, ...prev]);
    setShowScheduleForm(false);
  };

  const todayVisits = visits.filter(visit => 
    visit.date === new Date().toISOString().split('T')[0]
  );

  const upcomingVisits = visits.filter(visit => 
    new Date(visit.date) > new Date() && visit.status === 'scheduled'
  );

  return (
    <div className="field-visits-page">
      <div className="page-header">
        <h1>🌾 Field Visits</h1>
        <Button variant="primary" onClick={() => setShowScheduleForm(true)}>
          Schedule Visit
        </Button>
      </div>

      <div className="visits-grid">
        <Card className="today-visits">
          <h3>Today's Visits</h3>
          <div className="visits-list">
            {todayVisits.length > 0 ? (
              todayVisits.map(visit => (
                <div key={visit.id} className="visit-item today">
                  <div className="visit-time">{visit.time}</div>
                  <div className="visit-details">
                    <div className="farmer-name">{visit.farmer_name}</div>
                    <div className="visit-purpose">{visit.purpose}</div>
                    <div className="visit-location">{visit.location}</div>
                  </div>
                  <div className="visit-actions">
                    <Button size="small">Start Visit</Button>
                    <Button size="small" variant="outline">Reschedule</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-visits">No visits scheduled for today</div>
            )}
          </div>
        </Card>

        <Card className="upcoming-visits">
          <h3>Upcoming Visits</h3>
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'farmer_name', label: 'Farmer' },
              { key: 'purpose', label: 'Purpose' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={upcomingVisits.map(visit => ({
              ...visit,
              status: getStatusBadge(visit.status),
              actions: (
                <div className="action-buttons">
                  <Button size="small">Prepare</Button>
                  <Button size="small" variant="outline">Reschedule</Button>
                </div>
              )
            }))}
          />
        </Card>

        <Card className="visit-calendar">
          <h3>Visit Calendar</h3>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            events={visits.map(visit => ({
              date: visit.date,
              title: visit.farmer_name,
              type: visit.purpose
            }))}
          />
        </Card>

        <Card className="visit-preparation">
          <h3>Visit Preparation</h3>
          <div className="preparation-checklist">
            <h4>Standard Equipment Checklist</h4>
            <div className="checklist-items">
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Soil testing kit</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Moisture meter</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Plant disease guide</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Digital camera</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>GPS device</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Safety equipment</span>
              </label>
            </div>
          </div>
          <div className="quick-actions">
            <Button variant="outline" fullWidth>Print Checklist</Button>
            <Button variant="outline" fullWidth>Download Forms</Button>
            <Button variant="outline" fullWidth>View Farm History</Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showScheduleForm}
        onClose={() => setShowScheduleForm(false)}
        title="Schedule Field Visit"
        size="large"
      >
        <Form onSubmit={handleScheduleVisit}>
          <Input 
            name="farmer_name" 
            label="Farmer Name" 
            placeholder="Enter farmer name"
            required 
          />
          <Input 
            name="date" 
            label="Visit Date" 
            type="date"
            required 
          />
          <Input 
            name="time" 
            label="Visit Time" 
            type="time"
            required 
          />
          <Input 
            name="location" 
            label="Location/Address" 
            placeholder="Enter farm location"
            required 
          />
          <Select 
            name="purpose" 
            label="Visit Purpose"
            options={[
              { value: 'crop_inspection', label: 'Crop Inspection' },
              { value: 'disease_diagnosis', label: 'Disease Diagnosis' },
              { value: 'soil_analysis', label: 'Soil Analysis' },
              { value: 'irrigation_review', label: 'Irrigation Review' },
              { value: 'equipment_check', label: 'Equipment Check' },
              { value: 'training', label: 'Farmer Training' }
            ]}
            required
          />
          <Input 
            name="description" 
            label="Visit Description" 
            type="textarea"
            placeholder="Describe the purpose and objectives of this visit"
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Schedule Visit</Button>
            <Button type="button" onClick={() => setShowScheduleForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FieldVisits;