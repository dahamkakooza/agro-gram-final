// packages/ui/src/components/DatePicker/DatePicker.jsx
import React from 'react';
import './DatePicker.css';

const DatePicker = ({ label, value, onChange, ...props }) => {
  return (
    <div className="date-picker">
      {label && <label className="date-picker-label">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="date-picker-input"
        {...props}
      />
    </div>
  );
};

export default DatePicker;