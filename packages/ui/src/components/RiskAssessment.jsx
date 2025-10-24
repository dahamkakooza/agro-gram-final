import React from 'react';
import './RiskAssessment.css';

const RiskAssessment = ({ risks, onRiskUpdate }) => {
  return (
    <div className="risk-assessment">
      <h4>Risk Assessment</h4>
      <div className="risks-list">
        {risks?.map(risk => (
          <div key={risk.id} className="risk-item">
            <div className="risk-info">
              <div className="risk-name">{risk.name}</div>
              <div className="risk-description">{risk.description}</div>
            </div>
            <div className="risk-severity">
              <span className={`severity ${risk.severity}`}>
                {risk.severity}
              </span>
            </div>
            <button 
              className="update-btn"
              onClick={() => onRiskUpdate(risk)}
            >
              Update
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAssessment;