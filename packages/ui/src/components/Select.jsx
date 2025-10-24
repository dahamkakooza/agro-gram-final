import React from 'react';
import './Select.css';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error = '',
  className = '',
  ...props
}) => {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`select ${error ? 'select--error' : ''} ${disabled ? 'select--disabled' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error">{error}</span>}
    </div>
  );
};

export default Select;