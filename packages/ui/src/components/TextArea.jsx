import React from 'react';
import './TextArea.css';

const TextArea = ({
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error = '',
  className = '',
  rows = 3,
  ...props
}) => {
  const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`textarea-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`textarea ${error ? 'textarea--error' : ''} ${disabled ? 'textarea--disabled' : ''}`}
        {...props}
      />
      {error && <span className="textarea-error">{error}</span>}
    </div>
  );
};

export default TextArea;