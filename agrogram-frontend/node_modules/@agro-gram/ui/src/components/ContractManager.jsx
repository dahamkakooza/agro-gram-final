// src/components/common/ContractManager.jsx
import React from 'react';
import './ContractManager.css';

const ContractManager = ({ contracts, onContractSelect }) => {
  return (
    <div className="contract-manager">
      <div className="contracts-list">
        {contracts?.map(contract => (
          <div 
            key={contract.id} 
            className={`contract-item ${contract.status}`}
            onClick={() => onContractSelect?.(contract)}
          >
            <div className="contract-header">
              <span className="contract-id">#{contract.id}</span>
              <span className={`status-badge ${contract.status}`}>
                {contract.status}
              </span>
            </div>
            <div className="contract-parties">
              {contract.party_a} ↔ {contract.party_b}
            </div>
            <div className="contract-details">
              <span className="contract-value">${contract.value?.toLocaleString()}</span>
              <span className="contract-dates">
                {contract.start_date} - {contract.end_date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractManager;