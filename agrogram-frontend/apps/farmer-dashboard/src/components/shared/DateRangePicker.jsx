// src/components/shared/DateRangePicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import './DateRangePicker.css';

const DateRangePicker = ({ 
  onDateChange,
  presets = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' }
  ]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculatePresetDates = (preset) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        start = today;
        break;
      case 'last7':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30':
        start.setDate(today.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return { start: '', end: '' };
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const handlePresetSelect = (preset) => {
    const dates = calculatePresetDates(preset);
    setStartDate(dates.start);
    setEndDate(dates.end);
    setSelectedPreset(preset);
    onDateChange?.({ start: dates.start, end: dates.end, preset });
    setIsOpen(false);
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      setSelectedPreset('');
      onDateChange?.({ start: startDate, end: endDate, preset: 'custom' });
      setIsOpen(false);
    }
  };

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const displayText = selectedPreset 
    ? presets.find(p => p.value === selectedPreset)?.label
    : (startDate && endDate ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}` : 'Select Date Range');

  return (
    <div className="date-range-picker" ref={dropdownRef}>
      <button 
        className="date-range-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="calendar-icon">📅</span>
        <span className="date-range-text">{displayText}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="date-range-dropdown">
          <div className="preset-section">
            <h4>Quick Select</h4>
            <div className="preset-buttons">
              {presets.map(preset => (
                <button
                  key={preset.value}
                  className={`preset-button ${selectedPreset === preset.value ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-section">
            <h4>Custom Range</h4>
            <div className="date-inputs">
              <div className="date-input-group">
                <label>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
              <div className="date-input-group">
                <label>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
            <button
              className="apply-button"
              onClick={handleCustomDateChange}
              disabled={!startDate || !endDate}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;