import React from 'react';
import './CaseTracker.css';

const CaseTracker = ({ cases, onCaseSelect }) => {
  return (
    <div className="case-tracker">
      <h4>Legal Cases</h4>
      <div className="cases-list">
        {cases?.map(legalCase => (
          <div 
            key={legalCase.id} 
            className={`case-item ${legalCase.status}`}
            onClick={() => onCaseSelect(legalCase)}
          >
            <div className="case-icon">⚖️</div>
            <div className="case-details">
              <div className="case-title">{legalCase.title}</div>
              <div className="case-parties">
                {legalCase.party_a} vs {legalCase.party_b}
              </div>
              <div className="case-meta">
                <span>Type: {legalCase.case_type}</span>
                <span>Filed: {legalCase.filed_date}</span>
              </div>
            </div>
            <div className="case-status">{legalCase.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseTracker;