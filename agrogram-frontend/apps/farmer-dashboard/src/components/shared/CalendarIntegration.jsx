// src/components/shared/CalendarIntegration.jsx
import React, { useState } from 'react';
import './CalendarIntegration.css';

const CalendarIntegration = ({ 
  events = [],
  onEventClick,
  onDateSelect,
  view = 'month'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handlePrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setDate(prev.getDate() - 7);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(prev.getMonth() + 1);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    showNotification('info', 'Calendar', 'Jumped to today');
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    onEventClick?.(event);
    showNotification('info', 'Event Details', `Viewing ${event.title}`);
  };

  const renderMonthView = () => {
    // Simplified month view implementation
    return (
      <div className="calendar-month">
        <div className="month-header">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div className="month-grid">
          {/* Calendar grid would go here */}
          <div className="calendar-placeholder">
            <div className="calendar-icon">📅</div>
            <div>Monthly Calendar View</div>
            <div className="event-count">{events.length} events this month</div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="calendar-week">
        <div className="week-header">
          Week of {currentDate.toLocaleDateString()}
        </div>
        <div className="week-grid">
          {/* Week grid would go here */}
          <div className="calendar-placeholder">
            <div className="calendar-icon">📅</div>
            <div>Weekly Calendar View</div>
            <div className="event-count">{events.length} events this week</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-integration">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button className="control-button" onClick={handlePrevious}>
            Previous
          </button>
          <button className="control-button today-button" onClick={handleToday}>
            Today
          </button>
          <button className="control-button" onClick={handleNext}>
            Next
          </button>
        </div>
        
        <div className="view-selector">
          <button 
            className={`view-button ${view === 'month' ? 'active' : ''}`}
            onClick={() => {
              showNotification('info', 'Calendar View', 'Switched to month view');
              // In real app, this would change the view state
            }}
          >
            Month
          </button>
          <button 
            className={`view-button ${view === 'week' ? 'active' : ''}`}
            onClick={() => {
              showNotification('info', 'Calendar View', 'Switched to week view');
              // In real app, this would change the view state
            }}
          >
            Week
          </button>
        </div>
      </div>

      <div className="calendar-body">
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>

      <div className="calendar-sidebar">
        <div className="upcoming-events">
          <h4>Upcoming Events</h4>
          <div className="events-list">
            {events.slice(0, 5).map(event => (
              <div
                key={event.id}
                className={`event-item ${event.type}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-time">
                  {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  <div className="event-location">{event.location}</div>
                </div>
                <div className="event-type-indicator"></div>
              </div>
            ))}
          </div>
        </div>

        {selectedEvent && (
          <div className="event-details-panel">
            <h4>Event Details</h4>
            <div className="event-detail">
              <strong>Title:</strong> {selectedEvent.title}
            </div>
            <div className="event-detail">
              <strong>Time:</strong> {new Date(selectedEvent.start).toLocaleString()} - {new Date(selectedEvent.end).toLocaleString()}
            </div>
            <div className="event-detail">
              <strong>Location:</strong> {selectedEvent.location}
            </div>
            <div className="event-detail">
              <strong>Description:</strong> {selectedEvent.description}
            </div>
            <div className="event-actions">
              <button className="action-button edit">Edit</button>
              <button className="action-button delete">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarIntegration;