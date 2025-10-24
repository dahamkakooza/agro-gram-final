// src/components/shared/ProgressTracker.jsx
import React from 'react';
import './ProgressTracker.css';

const ProgressTracker = ({ 
  steps, 
  currentStep,
  onStepClick,
  interactive = false
}) => {
  return (
    <div className="progress-tracker">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={step.id} className="progress-step-container">
            <div className="progress-connector">
              {index > 0 && <div className={`connector-line ${isCompleted ? 'completed' : ''}`}></div>}
            </div>
            
            <div 
              className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''} ${interactive ? 'interactive' : ''}`}
              onClick={() => interactive && onStepClick?.(index)}
            >
              <div className="step-indicator">
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                {step.description && (
                  <div className="step-description">{step.description}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressTracker;