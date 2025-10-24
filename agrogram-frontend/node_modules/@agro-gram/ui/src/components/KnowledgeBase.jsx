import React from 'react';
import './KnowledgeBase.css';

const KnowledgeBase = ({ solutions, onSolutionSelect }) => {
  return (
    <div className="knowledge-base">
      <h4>Knowledge Base</h4>
      <div className="solutions-grid">
        {solutions?.map(solution => (
          <div 
            key={solution.id} 
            className="solution-card"
            onClick={() => onSolutionSelect(solution)}
          >
            <div className="solution-category">{solution.category}</div>
            <div className="solution-title">{solution.title}</div>
            <div className="solution-description">{solution.description}</div>
            <div className="solution-meta">
              <span className="effectiveness">{solution.effectiveness}% effective</span>
              <span className="usage">{solution.usage_count} uses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;