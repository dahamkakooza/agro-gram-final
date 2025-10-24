import React from 'react';
import './Tabs.css';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`tabs ${className}`}>
      <div className="tabs__header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tabs__tab ${activeTab === tab.id ? 'tabs__tab--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;