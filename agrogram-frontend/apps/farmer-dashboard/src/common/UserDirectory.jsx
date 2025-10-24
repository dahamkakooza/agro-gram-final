// src/components/common/UserDirectory.jsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/services.js';
import './UserDirectory.css';

const ModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalServiceTags = ({ user }) => {
  const getServicesBySubRole = (subRole) => {
    const serviceMap = {
      // Farmer services
      'SMALLHOLDER_FARMER': ['Fresh Produce', 'Local Crops', 'Seasonal Vegetables', 'Small Farm Products'],
      'COMMERCIAL_FARMER': ['Bulk Grains', 'Export Quality', 'Contract Farming', 'Large Scale Production'],
      'ORGANIC_SPECIALIST': ['Organic Produce', 'Certified Organic', 'Sustainable Farming', 'Eco-Friendly'],
      'LIVESTOCK_FARMER': ['Meat Products', 'Dairy', 'Animal Products', 'Livestock Management'],
      
      // Consumer services
      'INDIVIDUAL_CONSUMER': ['Product Purchases', 'Market Insights', 'Consumer Goods'],
      'RESTAURANT_BUSINESS': ['Bulk Purchasing', 'Supply Contracts', 'Fresh Ingredients'],
      'EXPORT_CLIENT': ['International Trade', 'Export Services', 'Global Market'],
      'INSTITUTIONAL_BUYER': ['Contract Procurement', 'Bulk Supply', 'Institutional Sales'],
      
      // Supplier services
      'LOGISTICS_PROVIDER': ['Transportation', 'Cold Chain', 'Delivery', 'Supply Chain'],
      'INPUT_SUPPLIER': ['Seeds', 'Fertilizers', 'Equipment', 'Farm Inputs'],
      'MACHINERY_PROVIDER': ['Equipment Rental', 'Maintenance', 'Farm Machinery'],
      'SERVICE_PROVIDER': ['Consulting', 'Technical Services', 'Professional Advice'],
      
      // Agent services
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

const UserDirectory = ({ currentUser, onUserSelect, onMessageUser }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 UserDirectory - Fetching users from API...');
      const response = await userAPI.getAllUsers();
      
      console.log('📊 UserDirectory - API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ UserDirectory - Users fetched successfully:', response.data.length);
        const usersData = Array.isArray(response.data) ? response.data : response.data.data || [];
        console.log('👥 Sample users:', usersData.slice(0, 3));
        setUsers(usersData);
      } else {
        const errorMsg = response.error || 'Failed to load users from server';
        console.error('❌ UserDirectory - API Error:', errorMsg);
        setError(errorMsg);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ UserDirectory - Network Error:', error);
      setError('Network error: Unable to connect to server');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.business_name?.toLowerCase().includes(term) ||
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        user.sub_role?.toLowerCase().includes(term) ||
        user.location?.toLowerCase().includes(term) ||
        user.business_description?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleRetry = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading user directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load users</h3>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-directory">
      <div className="directory-header">
        <h3>🌐 Ecosystem Network</h3>
        <p>Connect with {users.length} professionals in the Agro-Gram ecosystem</p>
      </div>

      <div className="directory-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name, business, location, or role..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="role-filters">
          <button 
            className={`filter-btn ${selectedRole === 'all' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('all')}
          >
            All ({users.length})
          </button>
          <button 
            className={`filter-btn ${selectedRole === 'FARMER' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('FARMER')}
          >
            Farmers ({users.filter(u => u.role === 'FARMER').length})
          </button>
          <button 
            className={`filter-btn ${selectedRole === 'CONSUMER' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('CONSUMER')}
          >
            Consumers ({users.filter(u => u.role === 'CONSUMER').length})
          </button>
          <button 
            className={`filter-btn ${selectedRole === 'SUPPLIER' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('SUPPLIER')}
          >
            Suppliers ({users.filter(u => u.role === 'SUPPLIER').length})
          </button>
          <button 
            className={`filter-btn ${selectedRole === 'AGENT' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('AGENT')}
          >
            Agents ({users.filter(u => u.role === 'AGENT').length})
          </button>
        </div>
      </div>

      <div className="directory-stats">
        <p>
          Showing {filteredUsers.length} of {users.length} users
          {selectedRole !== 'all' && ` in ${selectedRole}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <UserCard 
            key={user.id}
            user={user}
            onSelect={onUserSelect}
            onMessage={onMessageUser}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="no-users">
          <div className="no-users-icon">🔍</div>
          <h3>No users found</h3>
          <p>
            {searchTerm || selectedRole !== 'all' 
              ? 'Try changing your search criteria or filters'
              : 'No other users are currently registered in the system'
            }
          </p>
          {(searchTerm || selectedRole !== 'all') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, onSelect, onMessage }) => {
  const handleProfileClick = () => {
    onSelect(user);
  };

  const handleMessageClick = () => {
    onMessage(user);
  };

  return (
    <div className="user-card">
      <div className="user-header">
        <div className="user-avatar">
          {user.profile_picture ? (
            <img src={user.profile_picture} alt={`${user.first_name} ${user.last_name}`} />
          ) : (
            <div className="avatar-placeholder">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
          )}
          {user.is_verified && <div className="verified-badge">✓</div>}
        </div>
        <div className="user-info">
          <h4 onClick={handleProfileClick} className="user-name">
            {user.business_name || `${user.first_name} ${user.last_name}`}
          </h4>
          <p className="user-role">
            <span className="role-badge">{user.role}</span>
            <span className="subrole-badge">{user.sub_role}</span>
          </p>
          {user.location && (
            <p className="user-location">📍 {user.location}</p>
          )}
          {user.business_description && (
            <p className="user-description">{user.business_description}</p>
          )}
        </div>
      </div>

      <div className="user-stats">
        {user.total_orders > 0 && (
          <span className="stat">{user.total_orders} orders</span>
        )}
        {user.farm_size && (
          <span className="stat">{user.farm_size} ha</span>
        )}
        {user.is_verified && (
          <span className="stat verified">Verified</span>
        )}
      </div>

      <div className="user-services">
        <p className="services-label">Services Offered:</p>
        <ModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalModalServiceTags user={user} />
      </div>

      <div className="user-actions">
        <button 
          className="btn-profile"
          onClick={handleProfileClick}
        >
          View Profile
        </button>
        <button 
          className="btn-message"
          onClick={handleMessageClick}
        >
          💬 Message
        </button>
      </div>
    </div>
  );
};

export default UserDirectory;