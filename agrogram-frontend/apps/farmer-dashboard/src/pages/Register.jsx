import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, Select, LoadingSpinner } from '@agro-gram/ui';
import './Auth.css';

const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'FARMER',
    subRole: 'SMALLHOLDER_FARMER',
    businessName: '',
    location: '',
    farmSize: '',
    businessDescription: '',
    agreeToTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'role') {
      
      // When role changes, reset subRole to the default for that role
      const defaultSubRole = getDefaultSubRole(value);
      
      setFormData(prev => ({

        ...prev,
        role: value,
        subRole: defaultSubRole
      }));
      
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // NEW: Separate handler for sub-role changes
  const handleSubRoleChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      subRole: value
    }));
    
    if (validationErrors.subRole) {
      setValidationErrors(prev => ({
        ...prev,
        subRole: ''
      }));
    }
  };

  // Sub-role configuration
  const getSubRoles = (role) => {
    const subRoles = {
      FARMER: [
        { value: 'SMALLHOLDER_FARMER', label: 'Smallholder Farmer', description: 'Small-scale farming with daily operations focus' },
        { value: 'COMMERCIAL_FARMER', label: 'Commercial Farmer', description: 'Large-scale operations with business intelligence' },
        { value: 'ORGANIC_SPECIALIST', label: 'Organic Specialist', description: 'Certified organic operations with premium market access' },
        { value: 'LIVESTOCK_FARMER', label: 'Livestock Farmer', description: 'Animal health and product processing management' }
      ],
      CONSUMER: [
        { value: 'INDIVIDUAL_CONSUMER', label: 'Individual Consumer', description: 'Personal shopping with convenience focus' },
        { value: 'RESTAURANT_BUSINESS', label: 'Restaurant/Business', description: 'Supply chain and inventory integration' },
        { value: 'EXPORT_CLIENT', label: 'Export Client', description: 'International compliance and logistics' },
        { value: 'INSTITUTIONAL_BUYER', label: 'Institutional Buyer', description: 'Contract management and budgeting' }
      ],
      SUPPLIER: [
        { value: 'LOGISTICS_PROVIDER', label: 'Logistics Provider', description: 'Fleet optimization and delivery efficiency' },
        { value: 'INPUT_SUPPLIER', label: 'Input Supplier', description: 'Inventory and sales optimization' },
        { value: 'MACHINERY_PROVIDER', label: 'Machinery Provider', description: 'Equipment rental and maintenance' },
        { value: 'SERVICE_PROVIDER', label: 'Service Provider', description: 'Service delivery and booking management' }
      ],
      AGENT: [
        { value: 'FINANCIAL_ADVISOR', label: 'Financial Advisor', description: 'Loan portfolio and farmer financial health' },
        { value: 'TECHNICAL_ADVISOR', label: 'Technical Advisor', description: 'Problem resolution and knowledge sharing' },
        { value: 'LEGAL_SPECIALIST', label: 'Legal Specialist', description: 'Compliance and dispute resolution' },
        { value: 'MARKET_ANALYST', label: 'Market Analyst', description: 'Price intelligence and market insights' }
      ],
      ADMIN: [
        { value: 'PLATFORM_ADMIN', label: 'Platform Admin', description: 'System health and user management' },
        { value: 'BUSINESS_ADMIN', label: 'Business Admin', description: 'Revenue and business intelligence' }
      ]
    };
    return subRoles[role] || [];
  };

  const getDefaultSubRole = (role) => {
    const defaults = {
      FARMER: 'SMALLHOLDER_FARMER',
      CONSUMER: 'INDIVIDUAL_CONSUMER',
      SUPPLIER: 'INPUT_SUPPLIER',
      AGENT: 'FINANCIAL_ADVISOR',
      ADMIN: 'PLATFORM_ADMIN'
    };
    return defaults[role] || '';
  };

  const getSubRoleFeatures = (subRole) => {
    const features = {
      // Farmer Sub-roles
      SMALLHOLDER_FARMER: [
        'AI-generated daily task lists',
        'Simple crop management',
        'Immediate weather and price alerts',
        'Basic revenue tracking',
        'Mobile-optimized interface'
      ],
      COMMERCIAL_FARMER: [
        'Multi-farm operational dashboard',
        'Supply chain management',
        'Advanced business intelligence',
        'Bulk contract identification',
        'Enterprise system integration'
      ],
      ORGANIC_SPECIALIST: [
        'Certification status tracking',
        'Quality management tools',
        'Premium marketplace access',
        'Compliance documentation',
        'Sustainable agriculture network'
      ],
      LIVESTOCK_FARMER: [
        'Livestock health monitoring',
        'Animal management programs',
        'Product processing operations',
        'Veterinary coordination',
        'Mobile-optimized for field use'
      ],
      
      // Consumer Sub-roles
      INDIVIDUAL_CONSUMER: [
        'AI-curated product recommendations',
        'Quick order system',
        'Delivery management',
        'Personal analytics',
        'Food community connections'
      ],
      RESTAURANT_BUSINESS: [
        'Supply chain overview',
        'Template-based ordering',
        'Inventory integration',
        'Menu planning tools',
        'Quality control monitoring'
      ],
      EXPORT_CLIENT: [
        'Global trade overview',
        'Export management tools',
        'Compliance documentation',
        'International pricing intelligence',
        'Global partner network'
      ],
      INSTITUTIONAL_BUYER: [
        'Contract management',
        'Tender management tools',
        'Budget compliance tracking',
        'Quality assurance monitoring',
        'Supplier performance tracking'
      ],
      
      // Supplier Sub-roles
      LOGISTICS_PROVIDER: [
        'Fleet command center',
        'Intelligent delivery prioritization',
        'AI-powered route optimization',
        'Maintenance scheduling',
        'Performance analytics'
      ],
      INPUT_SUPPLIER: [
        'Inventory & sales snapshot',
        'Multi-location inventory management',
        'Customer relationship management',
        'Sales intelligence',
        'Competitive analysis'
      ],
      MACHINERY_PROVIDER: [
        'Equipment fleet overview',
        'Rental operations management',
        'Predictive maintenance',
        'Revenue optimization',
        'Customer management'
      ],
      SERVICE_PROVIDER: [
        'Service operations overview',
        'Booking management',
        'Mobile workforce coordination',
        'Customer relations',
        'Business performance analytics'
      ],
      
      // Agent Sub-roles
      FINANCIAL_ADVISOR: [
        'Financial portfolio overview',
        'Loan management',
        'Risk assessment tools',
        'Impact analytics',
        'Financial product development'
      ],
      TECHNICAL_ADVISOR: [
        'Active advisory cases',
        'Remote diagnosis tools',
        'Knowledge base integration',
        'Impact measurement',
        'Continuous learning resources'
      ],
      LEGAL_SPECIALIST: [
        'Legal cases overview',
        'Compliance hub',
        'Document management',
        'Dispute resolution',
        'Legal resources library'
      ],
      MARKET_ANALYST: [
        'Market intelligence overview',
        'Price intelligence feeds',
        'Supply-demand analysis',
        'Automated reporting',
        'Alert management'
      ],
      
      // Admin Sub-roles
      PLATFORM_ADMIN: [
        'Platform health monitoring',
        'User management',
        'System performance tracking',
        'Feature deployment',
        'Support operations'
      ],
      BUSINESS_ADMIN: [
        'Business overview analytics',
        'Revenue analysis',
        'Partnership management',
        'Strategic planning tools',
        'Executive reporting'
      ]
    };
    return features[subRole] || [];
  };

  const getDashboardRoute = (subRole) => {
    const routes = {
      // Farmer dashboards
      SMALLHOLDER_FARMER: '/dashboard/farmer/smallholder',
      COMMERCIAL_FARMER: '/dashboard/farmer/commercial',
      ORGANIC_SPECIALIST: '/dashboard/farmer/organic',
      LIVESTOCK_FARMER: '/dashboard/farmer/livestock',
      
      // Consumer dashboards
      INDIVIDUAL_CONSUMER: '/dashboard/consumer/individual',
      RESTAURANT_BUSINESS: '/dashboard/consumer/restaurant',
      EXPORT_CLIENT: '/dashboard/consumer/export',
      INSTITUTIONAL_BUYER: '/dashboard/consumer/institutional',
      
      // Supplier dashboards
      LOGISTICS_PROVIDER: '/dashboard/supplier/logistics',
      INPUT_SUPPLIER: '/dashboard/supplier/input',
      MACHINERY_PROVIDER: '/dashboard/supplier/machinery',
      SERVICE_PROVIDER: '/dashboard/supplier/service',
      
      // Agent dashboards
      FINANCIAL_ADVISOR: '/dashboard/agent/financial',
      TECHNICAL_ADVISOR: '/dashboard/agent/technical',
      LEGAL_SPECIALIST: '/dashboard/agent/legal',
      MARKET_ANALYST: '/dashboard/agent/market',
      
      // Admin dashboards
      PLATFORM_ADMIN: '/dashboard/admin/platform',
      BUSINESS_ADMIN: '/dashboard/admin/business'
    };
    return routes[subRole] || '/dashboard';
  };

  const validateForm = () => {
    const errors = {};
    setValidationErrors({});
    setError('');

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.subRole) {
      errors.subRole = 'Please select a specific role type';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    if (['FARMER', 'SUPPLIER', 'AGENT'].includes(formData.role)) {
      if (!formData.businessName.trim()) {
        errors.businessName = `${getRoleLabel(formData.role)} name is required`;
      }
      if (!formData.location.trim()) {
        errors.location = 'Location is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getRoleLabel = (role) => {
    const labels = {
      FARMER: 'Farm',
      CONSUMER: 'Consumer', 
      SUPPLIER: 'Business',
      ADMIN: 'Administrator',
      AGENT: 'Organization'
    };
    return labels[role] || role;
  };

  const getSubRoleLabel = (subRole) => {
    const subRoleLabels = {
      // Farmer
      SMALLHOLDER_FARMER: 'Smallholder Farmer',
      COMMERCIAL_FARMER: 'Commercial Farmer',
      ORGANIC_SPECIALIST: 'Organic Specialist',
      LIVESTOCK_FARMER: 'Livestock Farmer',
      // Consumer
      INDIVIDUAL_CONSUMER: 'Individual Consumer',
      RESTAURANT_BUSINESS: 'Restaurant/Business',
      EXPORT_CLIENT: 'Export Client',
      INSTITUTIONAL_BUYER: 'Institutional Buyer',
      // Supplier
      LOGISTICS_PROVIDER: 'Logistics Provider',
      INPUT_SUPPLIER: 'Input Supplier',
      MACHINERY_PROVIDER: 'Machinery Provider',
      SERVICE_PROVIDER: 'Service Provider',
      // Agent
      FINANCIAL_ADVISOR: 'Financial Advisor',
      TECHNICAL_ADVISOR: 'Technical Advisor',
      LEGAL_SPECIALIST: 'Legal Specialist',
      MARKET_ANALYST: 'Market Analyst',
      // Admin
      PLATFORM_ADMIN: 'Platform Admin',
      BUSINESS_ADMIN: 'Business Admin'
    };
    return subRoleLabels[subRole] || subRole;
  };
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phoneNumber.trim() || undefined,
        role: formData.role,
        sub_role: formData.subRole,
        location: formData.location.trim(),
      };

      if (['FARMER', 'SUPPLIER', 'AGENT'].includes(formData.role)) {
        registrationData.business_name = formData.businessName.trim();
      }

      if (formData.role === 'FARMER' && formData.farmSize) {
        registrationData.farm_size = parseFloat(formData.farmSize);
      }

      if (formData.role === 'SUPPLIER') {
        registrationData.business_description = formData.businessDescription.trim() || undefined;
      }

      // Clean up undefined or empty values
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] === undefined || registrationData[key] === '') {
          delete registrationData[key];
        }
      });
      // ADD THIS DEBUG LOG
      console.log('📝 Registration data:', registrationData);
      console.log('🚀 SENDING REGISTRATION DATA:', JSON.stringify(registrationData, null, 2));
      console.log('📋 Sub-role being sent:', formData.subRole);
      const result = await register(registrationData);
      // alert (JSON.stringify(registrationData));
      
      if (result.success) {
        const dashboardRoute = getDashboardRoute(formData.subRole);
        setSuccess(`Registration successful! Redirecting to your ${getSubRoleLabel(formData.subRole)} dashboard...`);
        
        setTimeout(() => {
          navigate(dashboardRoute, { replace: true });
        }, 2000);
      } else {
        if (result.details && typeof result.details === 'object') {
          setValidationErrors(result.details);
          setError('Please fix the validation errors below');
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Role options
  const roleOptions = [
    { value: 'FARMER', label: 'Farmer' },
    { value: 'CONSUMER', label: 'Consumer' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'AGENT', label: 'Agricultural Agent' },
    { value: 'ADMIN', label: 'Administrator' }
  ];

  const currentSubRoles = getSubRoles(formData.role);
  const currentSubRoleInfo = currentSubRoles.find(sr => sr.value === formData.subRole);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="large">
          <div className="auth-header">
            <h1>Join Agro-Gram</h1>
            <p>Create your account and select your specialized role in the agricultural ecosystem</p>
          </div>

          {error && !Object.keys(validationErrors).length && (
            <div className="auth-message auth-error">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="auth-message auth-success">
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                    disabled={loading}
                    error={!!validationErrors.firstName}
                  />
                  {validationErrors.firstName && (
                    <span className="field-error">{validationErrors.firstName}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                    disabled={loading}
                    error={!!validationErrors.lastName}
                  />
                  {validationErrors.lastName && (
                    <span className="field-error">{validationErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  error={!!validationErrors.email}
                />
                {validationErrors.email && (
                  <span className="field-error">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                  error={!!validationErrors.phoneNumber}
                />
                {validationErrors.phoneNumber && (
                  <span className="field-error">{validationErrors.phoneNumber}</span>
                )}
              </div>
            </div>

            {/* Account Security */}
            <div className="form-section">
              <h3>Account Security</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password (min. 6 characters)"
                    required
                    disabled={loading}
                    error={!!validationErrors.password}
                  />
                  {validationErrors.password && (
                    <span className="field-error">{validationErrors.password}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    error={!!validationErrors.confirmPassword}
                  />
                  {validationErrors.confirmPassword && (
                    <span className="field-error">{validationErrors.confirmPassword}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-section">
              <h3>Account Type</h3>
              
              <div className="form-group">
                <label htmlFor="role">Select Your Main Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: validationErrors.role ? '1px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-role Selection */}
              <div className="form-group">
                <label htmlFor="subRole">Select Your Specialized Role *</label>
                <select
                  id="subRole"
                  name="subRole"
                  value={formData.subRole}
                  onChange={handleSubRoleChange}
                  disabled={loading || currentSubRoles.length === 0}
                  className="form-select"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: validationErrors.subRole ? '1px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  {currentSubRoles.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.subRole && (
                  <span className="field-error">{validationErrors.subRole}</span>
                )}
                
                {/* Sub-role Information */}
                {currentSubRoleInfo && (
                  <div className="role-info">
                    <div className="role-header">
                      <h4>{currentSubRoleInfo.label}</h4>
                      <p className="role-description">
                        {currentSubRoleInfo.description}
                      </p>
                    </div>
                    
                    <div className="role-features">
                      <h5>Specialized Features:</h5>
                      <ul>
                        {getSubRoleFeatures(formData.subRole).map((feature, index) => (
                          <li key={index}>
                            <span className="feature-icon">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Information */}
            {['FARMER', 'SUPPLIER', 'AGENT'].includes(formData.role) && (
              <div className="form-section">
                <h3>Business Information</h3>
                
                <div className="form-group">
                  <label htmlFor="businessName">
                    {formData.role === 'FARMER' ? 'Farm Name *' : 
                     formData.role === 'AGENT' ? 'Organization Name *' : 'Business Name *'}
                  </label>
                  <Input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder={
                      formData.role === 'FARMER' 
                        ? 'Enter your farm name' 
                        : formData.role === 'AGENT'
                        ? 'Enter your organization name'
                        : 'Enter your business name'
                    }
                    required
                    disabled={loading}
                    error={!!validationErrors.businessName}
                  />
                  {validationErrors.businessName && (
                    <span className="field-error">{validationErrors.businessName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <Input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                    disabled={loading}
                    required
                    error={!!validationErrors.location}
                  />
                  {validationErrors.location && (
                    <span className="field-error">{validationErrors.location}</span>
                  )}
                </div>

                {formData.role === 'FARMER' && (
                  <div className="form-group">
                    <label htmlFor="farmSize">Farm Size (acres)</label>
                    <Input
                      type="number"
                      id="farmSize"
                      name="farmSize"
                      value={formData.farmSize}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                )}

                {formData.role === 'SUPPLIER' && (
                  <div className="form-group">
                    <label htmlFor="businessDescription">Business Description</label>
                    <Input
                      type="text"
                      id="businessDescription"
                      name="businessDescription"
                      value={formData.businessDescription}
                      onChange={handleChange}
                      placeholder="Describe your business and products"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="form-section">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <span>
                    I agree to the <Link to="/terms" className="auth-link">Terms of Service</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link> *
                  </span>
                </label>
                {validationErrors.agreeToTerms && (
                  <span className="field-error">{validationErrors.agreeToTerms}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="auth-button-container">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    Creating Account...
                  </>
                ) : (
                  `Create ${getSubRoleLabel(formData.subRole)} Account`
                )}
              </Button>
            </div>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;