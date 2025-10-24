import React from 'react';
import './MobileWorkforce.css';

const MobileWorkforce = ({ technicians, onTechnicianAssign }) => {
  return (
    <div className="mobile-workforce">
      <h4>Mobile Workforce</h4>
      <div className="technicians-grid">
        {technicians?.map(technician => (
          <div key={technician.id} className="technician-card">
            <div className="technician-avatar">
              {technician.avatar || '👷'}
            </div>
            <div className="technician-info">
              <div className="technician-name">{technician.name}</div>
              <div className="technician-specialty">{technician.specialty}</div>
              <div className="technician-status">
                <span className={`status ${technician.status}`}>
                  {technician.status}
                </span>
                <span className="location">{technician.location}</span>
              </div>
            </div>
            <button 
              className="assign-btn"
              onClick={() => onTechnicianAssign(technician)}
            >
              Assign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileWorkforce;