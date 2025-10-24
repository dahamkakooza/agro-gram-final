/*
// src/components/forms/ServiceRequestForm.jsx
import React, { useState } from 'react';
import { messagingAPI } from  "../../../../packages/api/src/services.js";
import './ServiceRequestForm.css';

const ServiceRequestForm = ({ targetUser, serviceType, formType, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getFormConfig = (formType) => {
    const formConfigs = {
      'LoanApplicationForm': {
        title: 'Loan Application Request',
        fields: [
          { name: 'loan_amount', label: 'Loan Amount', type: 'number', required: true },
          { name: 'purpose', label: 'Loan Purpose', type: 'textarea', required: true },
          { name: 'repayment_period', label: 'Preferred Repayment Period (months)', type: 'number' },
          { name: 'collateral', label: 'Collateral Details', type: 'textarea' }
        ]
      },
      'LegalConsultationForm': {
        title: 'Legal Consultation Request',
        fields: [
          { name: 'legal_issue', label: 'Describe Your Legal Issue', type: 'textarea', required: true },
          { name: 'documents', label: 'Relevant Documents', type: 'file' },
          { name: 'urgency', label: 'Urgency Level', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      },
      'TechnicalSupportForm': {
        title: 'Technical Support Request',
        fields: [
          { name: 'issue_type', label: 'Issue Type', type: 'select', 
            options: ['Crop Disease', 'Soil Quality', 'Irrigation', 'Pest Control', 'Other'] },
          { name: 'description', label: 'Problem Description', type: 'textarea', required: true },
          { name: 'affected_area', label: 'Affected Area (hectares)', type: 'number' }
        ]
      },
      'GeneralInquiryForm': {
        title: 'Service Inquiry',
        fields: [
          { name: 'inquiry_type', label: 'Inquiry Type', type: 'text', required: true },
          { name: 'details', label: 'Details', type: 'textarea', required: true },
          { name: 'budget', label: 'Estimated Budget', type: 'number' }
        ]
      }
    };

    return formConfigs[formType] || formConfigs['GeneralInquiryForm'];
  };

  const formConfig = getFormConfig(formType);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create conversation with form data
      const messageContent = `Service Request: ${formConfig.title}\n\n` +
        Object.entries(formData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

      const result = await messagingAPI.createConversation({
        recipient_id: targetUser.id,
        initial_message: messageContent,
        service_type: serviceType,
        form_data: formData,
        form_type: formType
      });

      if (result.success) {
        onSubmit(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleInputChange(field.name, e.target.files[0])}
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="service-form-modal">
      <div className="form-header">
        <h3>{formConfig.title}</h3>
        <p>Requesting service from: {targetUser.business_name || `${targetUser.first_name} ${targetUser.last_name}`}</p>
      </div>

      <form onSubmit={handleSubmit} className="service-form">
        {formConfig.fields.map(field => (
          <div key={field.name} className="form-field">
            <label>{field.label}{field.required && '*'}</label>
            {renderField(field)}
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRequestForm;
*/
// src/components/forms/ServiceRequestForm.jsx
import React, { useState } from 'react';
import { messagingAPI } from "../../../../packages/api/src/services.js";
import './ServiceRequestForm.css';

const ServiceRequestForm = ({ targetUser, serviceType, formType, onClose, onSubmit }) => {
  const [selectedService, setSelectedService] = useState(serviceType || '');
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Service dropdown options based on target user's role
  const getServiceOptions = (userRole) => {
    const serviceOptions = {
      'FINANCIAL_ADVISOR': [
        'Loan Application',
        'Financial Consultation',
        'Investment Advice',
        'Risk Assessment',
        'Credit Scoring'
      ],
      'LEGAL_SPECIALIST': [
        'Legal Consultation',
        'Contract Review',
        'Dispute Resolution',
        'Compliance Check',
        'Document Preparation'
      ],
      'TECHNICAL_ADVISOR': [
        'Crop Health Analysis',
        'Soil Testing',
        'Irrigation Planning',
        'Pest Management',
        'Equipment Consultation'
      ],
      'MARKET_ANALYST': [
        'Market Research',
        'Price Analysis',
        'Trend Forecasting',
        'Competitor Analysis',
        'Sales Strategy'
      ],
      'LOGISTICS_PROVIDER': [
        'Delivery Service',
        'Fleet Management',
        'Route Optimization',
        'Supply Chain Consultation'
      ],
      'MACHINERY_PROVIDER': [
        'Equipment Rental',
        'Maintenance Service',
        'Operator Training',
        'Equipment Consultation'
      ],
      'INPUT_SUPPLIER': [
        'Product Inquiry',
        'Bulk Order',
        'Price Quote',
        'Delivery Request'
      ],
      'ORGANIC_SPECIALIST': [
        'Certification Guidance',
        'Organic Consultation',
        'Quality Assessment',
        'Market Access'
      ]
    };
    return serviceOptions[userRole] || ['General Inquiry'];
  };

  const getFormConfig = (serviceType) => {
    const formConfigs = {
      'Loan Application': {
        title: 'Loan Application Request',
        fields: [
          { name: 'loan_amount', label: 'Loan Amount', type: 'number', required: true },
          { name: 'purpose', label: 'Loan Purpose', type: 'textarea', required: true },
          { name: 'repayment_period', label: 'Preferred Repayment Period (months)', type: 'number' },
          { name: 'collateral', label: 'Collateral Details', type: 'textarea' }
        ]
      },
      'Legal Consultation': {
        title: 'Legal Consultation Request',
        fields: [
          { name: 'legal_issue', label: 'Describe Your Legal Issue', type: 'textarea', required: true },
          { name: 'documents', label: 'Relevant Documents', type: 'file' },
          { name: 'urgency', label: 'Urgency Level', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      },
      'Crop Health Analysis': {
        title: 'Crop Health Analysis Request',
        fields: [
          { name: 'crop_type', label: 'Crop Type', type: 'text', required: true },
          { name: 'issue_description', label: 'Problem Description', type: 'textarea', required: true },
          { name: 'affected_area', label: 'Affected Area (hectares)', type: 'number' },
          { name: 'symptoms', label: 'Observed Symptoms', type: 'textarea' }
        ]
      },
      'Market Research': {
        title: 'Market Research Request',
        fields: [
          { name: 'research_topic', label: 'Research Topic', type: 'text', required: true },
          { name: 'target_market', label: 'Target Market', type: 'text' },
          { name: 'timeframe', label: 'Research Timeframe', type: 'select', options: ['1 week', '2 weeks', '1 month', 'Custom'] },
          { name: 'budget', label: 'Research Budget', type: 'number' }
        ]
      },
      'General Inquiry': {
        title: 'Service Inquiry',
        fields: [
          { name: 'inquiry_type', label: 'Inquiry Type', type: 'text', required: true },
          { name: 'details', label: 'Details', type: 'textarea', required: true },
          { name: 'budget', label: 'Estimated Budget', type: 'number' }
        ]
      }
    };

    return formConfigs[serviceType] || formConfigs['General Inquiry'];
  };

  const serviceOptions = getServiceOptions(targetUser?.role);
  const formConfig = getFormConfig(selectedService);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const messageContent = `Service Request: ${formConfig.title}\n\n` +
        Object.entries(formData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

      const result = await messagingAPI.createConversation({
        recipient_id: targetUser.id,
        initial_message: messageContent,
        service_type: selectedService,
        form_data: formData,
        form_type: selectedService
      });

      if (result.success) {
        onSubmit(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleInputChange(field.name, e.target.files[0])}
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="service-form-modal">
      <div className="form-header">
        <h3>Service Request</h3>
        <p>Requesting service from: {targetUser.business_name || `${targetUser.first_name} ${targetUser.last_name}`}</p>
      </div>

      <form onSubmit={handleSubmit} className="service-form">
        {/* Service Type Dropdown */}
        <div className="form-field">
          <label>Service Type*</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">Select a service...</option>
            {serviceOptions.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Form Fields based on selected service */}
        {selectedService && formConfig.fields.map(field => (
          <div key={field.name} className="form-field">
            <label>{field.label}{field.required && '*'}</label>
            {renderField(field)}
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || !selectedService}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRequestForm;