// src/components/common/UserProfileModal.jsx
import React from 'react';
import './UserProfileModal.css';

// Define ModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalServiceTags FIRST with unique name
const ModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalServiceTags = ({ user }) => {
  const getServicesBySubRole = (subRole) => {
    const serviceMap = {
      'SMALLHOLDER_FARMER': ['Fresh Produce', 'Local Crops', 'Seasonal Vegetables', 'Small Farm Products'],
      'COMMERCIAL_FARMER': ['Bulk Grains', 'Export Quality', 'Contract Farming', 'Large Scale Production'],
      'ORGANIC_SPECIALIST': ['Organic Produce', 'Certified Organic', 'Sustainable Farming', 'Eco-Friendly'],
      'LIVESTOCK_FARMER': ['Meat Products', 'Dairy', 'Animal Products', 'Livestock Management'],
      'INDIVIDUAL_CONSUMER': ['Product Purchases', 'Market Insights', 'Consumer Goods'],
      'RESTAURANT_BUSINESS': ['Bulk Purchasing', 'Supply Contracts', 'Fresh Ingredients'],
      'EXPORT_CLIENT': ['International Trade', 'Export Services', 'Global Market'],
      'INSTITUTIONAL_BUYER': ['Contract Procurement', 'Bulk Supply', 'Institutional Sales'],
      'LOGISTICS_PROVIDER': ['Transportation', 'Cold Chain', 'Delivery', 'Supply Chain'],
      'INPUT_SUPPLIER': ['Seeds', 'Fertilizers', 'Equipment', 'Farm Inputs'],
      'MACHINERY_PROVIDER': ['Equipment Rental', 'Maintenance', 'Farm Machinery'],
      'SERVICE_PROVIDER': ['Consulting', 'Technical Services', 'Professional Advice'],
      'FINANCIAL_ADVISOR': ['Loans', 'Financial Planning', 'Risk Assessment', 'Investment Advice'],
      'TECHNICAL_ADVISOR': ['Technical Support', 'Crop Advice', 'Farm Management', 'Agronomy'],
      'LEGAL_SPECIALIST': ['Legal Advice', 'Contract Review', 'Compliance', 'Dispute Resolution'],
      'MARKET_ANALYST': ['Market Research', 'Price Analysis', 'Trends', 'Business Intelligence']
    };

    return serviceMap[subRole] || ['Agricultural Services'];
  };

  const services = getServicesBySubRole(user.sub_role);

  return (
    <div className="service-tags">
      {services.map((service, index) => (
        <span key={index} className="service-tag">
          {service}
        </span>
      ))}
    </div>
  );
};

// Define ServiceButtons SECOND
const ModalServiceButtons = ({ user, onRequest }) => {
  const getServiceOptions = (subRole) => {
    const optionsMap = {
      'FINANCIAL_ADVISOR': [
        { type: 'loan_application', label: 'Apply for Loan' },
        { type: 'financial_advice', label: 'Financial Consultation' },
        { type: 'risk_assessment', label: 'Risk Assessment' }
      ],
      'LEGAL_SPECIALIST': [
        { type: 'contract_review', label: 'Contract Review' },
        { type: 'legal_advice', label: 'Legal Consultation' },
        { type: 'dispute_resolution', label: 'Dispute Resolution' }
      ],
      'TECHNICAL_ADVISOR': [
        { type: 'crop_advice', label: 'Crop Advice' },
        { type: 'technical_support', label: 'Technical Support' },
        { type: 'farm_planning', label: 'Farm Planning' }
      ],
      'LOGISTICS_PROVIDER': [
        { type: 'transport_request', label: 'Request Transport' },
        { type: 'delivery_quote', label: 'Get Delivery Quote' },
        { type: 'logistics_consult', label: 'Logistics Consultation' }
      ]
    };

    return optionsMap[subRole] || [{ type: 'general_inquiry', label: 'General Inquiry' }];
  };

  const services = getServiceOptions(user.sub_role);

  return (
    <>
      {services.map(service => (
        <button
          key={service.type}
          className="btn btn-outline"
          onClick={() => onRequest(service.type)}
        >
          {service.label}
        </button>
      ))}
    </>
  );
};

// MAIN COMPONENT - defined LAST
const UserProfileModal = ({ user, isOpen, onClose, onMessage, onRequestService }) => {
  if (!isOpen || !user) return null;

  const getServiceForms = (subRole) => {
    const formMap = {
      'FINANCIAL_ADVISOR': 'LoanApplicationForm',
      'LEGAL_SPECIALIST': 'LegalConsultationForm',
      'TECHNICAL_ADVISOR': 'TechnicalSupportForm',
      'LOGISTICS_PROVIDER': 'LogisticsRequestForm',
      'INPUT_SUPPLIER': 'ProductInquiryForm',
      // Add more sub-role forms as needed
    };
    return formMap[subRole] || 'GeneralInquiryForm';
  };

  const handleServiceRequest = (serviceType) => {
    const formType = getServiceForms(user.sub_role);
    onRequestService(user, serviceType, formType);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-details">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={`${user.first_name} ${user.last_name}`} />
              ) : (
                <div className="avatar-large">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{user.business_name || `${user.first_name} ${user.last_name}`}</h3>
              <p className="role-badge">{user.role} • {user.sub_role}</p>
              {user.is_verified && <span className="verified-badge">✅ Verified</span>}
            </div>
          </div>

          <div className="profile-sections">
            <div className="section">
              <h4>📍 Location</h4>
              <p>{user.location || 'Not specified'}</p>
            </div>

            <div className="section">
              <h4>📊 Business Info</h4>
              <p>{user.business_description || 'No description provided'}</p>
              {user.farm_size && <p>Farm Size: {user.farm_size} hectares</p>}
              {user.farm_types && user.farm_types.length > 0 && (
                <p>Farm Types: {user.farm_types.join(', ')}</p>
              )}
            </div>

            <div className="section">
              <h4>🛠️ Services Offered</h4>
              <ModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalServiceTags user={user} />
            </div>

            <div className="section">
              <h4>📈 Activity Stats</h4>
              <div className="activity-stats">
                <div className="stat">
                  <span className="stat-value">{user.total_orders || 0}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{user.login_count || 0}</span>
                  <span className="stat-label">Logins</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="stat-label">Member Since</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="btn btn-primary"
              onClick={() => onMessage(user)}
            >
              💬 Send Message
            </button>
            
            <div className="service-requests">
              <h4>Request Specific Service:</h4>
              <div className="service-buttons">
                <ModalServiceButtons user={user} onRequest={handleServiceRequest} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;