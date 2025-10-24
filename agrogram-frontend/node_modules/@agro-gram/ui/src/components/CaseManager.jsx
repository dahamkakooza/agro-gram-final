import React from 'react';
import './CaseManager.css';

const CaseManager = ({ cases, onCaseSelect }) => {
  return (
    <div className="case-manager">
      <h4>Advisory Cases</h4>
      <div className="cases-list">
        {cases?.map(caseItem => (
          <div 
            key={caseItem.id} 
            className={`case-item ${caseItem.priority}`}
            onClick={() => onCaseSelect(caseItem)}
          >
            <div className="case-icon">📋</div>
            <div className="case-details">
              <div className="case-title">{caseItem.title}</div>
              <div className="case-farmer">{caseItem.farmer_name}</div>
              <div className="case-meta">
                <span>Created: {caseItem.created_date}</span>
                <span>Status: {caseItem.status}</span>
              </div>
            </div>
            <div className="case-priority">{caseItem.priority}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseManager;