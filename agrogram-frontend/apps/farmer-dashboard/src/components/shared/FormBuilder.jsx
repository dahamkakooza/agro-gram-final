// src/components/shared/FormBuilder.jsx
import React from 'react';
import './FormBuilder.css';

const FormBuilder = ({ 
  fields, 
  onSubmit, 
  submitText = "Submit",
  loading = false 
}) => {
  const [formData, setFormData] = React.useState({});
  const [errors, setErrors] = React.useState({});

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.validation && formData[field.name]) {
        const isValid = field.validation(formData[field.name]);
        if (!isValid) {
          newErrors[field.name] = field.validationMessage || 'Invalid format';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      value: formData[field.name] || '',
      onChange: (e) => handleChange(field.name, e.target.value),
      placeholder: field.placeholder,
      disabled: loading,
      className: `form-field ${errors[field.name] ? 'error' : ''}`
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return <input type={field.type} {...commonProps} />;
      
      case 'textarea':
        return <textarea rows={4} {...commonProps} />;
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return <input type="date" {...commonProps} />;
      
      case 'file':
        return (
          <input 
            type="file" 
            onChange={(e) => handleChange(field.name, e.target.files[0])}
            disabled={loading}
          />
        );
      
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <form className="form-builder" onSubmit={handleSubmit}>
      {fields.map(field => (
        <div key={field.name} className="form-field-group">
          <label className="field-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <span className="error-message">{errors[field.name]}</span>
          )}
        </div>
      ))}
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Submitting...' : submitText}
      </button>
    </form>
  );
};

export default FormBuilder;