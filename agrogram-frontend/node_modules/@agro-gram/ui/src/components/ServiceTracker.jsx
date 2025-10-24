import React from 'react';
import './ServiceTracker.css';

const ServiceTracker = ({ services, onServiceSelect }) => {
  return (
    <div className="service-tracker">
      <h4>Service Operations</h4>
      <div className="services-list">
        {services?.map(service => (
          <div 
            key={service.id} 
            className={`service-item ${service.priority}`}
            onClick={() => onServiceSelect(service)}
          >
            <div className="service-icon">🔧</div>
            <div className="service-details">
              <div className="service-type">{service.type}</div>
              <div className="service-customer">{service.customer}</div>
              <div className="service-meta">
                <span>{service.location}</span>
                <span>{service.scheduled_time}</span>
              </div>
            </div>
            <div className="service-status">{service.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTracker;