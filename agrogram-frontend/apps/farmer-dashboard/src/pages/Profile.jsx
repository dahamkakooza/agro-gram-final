import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '@agro-gram/api';
import { Card, Button, LoadingSpinner, Input, Select, TextArea, Tabs } from '@agro-gram/ui';

import './Profile.css';

const Profile = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    location: '',
    farm_size: '',
    business_name: '',
    business_description: '',
    latitude: '',
    longitude: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    price_range_min: '',
    price_range_max: '',
    quality_preference: 'STANDARD',
    preferred_locations: []
  });

  useEffect(() => {
    if (userProfile) {
      initializeForms();
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const initializeForms = () => {
    if (userProfile) {
      setProfileForm({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone_number: userProfile.phone_number || '',
        location: userProfile.location || '',
        farm_size: userProfile.farm_size || '',
        business_name: userProfile.business_name || '',
        business_description: userProfile.business_description || '',
        latitude: userProfile.latitude || '',
        longitude: userProfile.longitude || ''
      });

      if (userProfile.preferences) {
        setPreferencesForm({
          price_range_min: userProfile.preferences.price_range_min || '',
          price_range_max: userProfile.preferences.price_range_max || '',
          quality_preference: userProfile.preferences.quality_preference || 'STANDARD',
          preferred_locations: userProfile.preferences.preferred_locations || []
        });
      }
    }
  };

  // Helper function for default stats
  const getDefaultStats = () => ({
    total_farms: 0,
    total_plots: 0,
    active_crops: 0,
    pending_tasks: 0,
    total_orders: 0,
    total_revenue: 0,
    profile_completion: 0,
    productivity_level: 'MEDIUM',
    success_rate: 0,
    efficiency_score: 0
  });

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use individual try-catch for each API call
      try {
        const activitiesResponse = await userAPI.getActivities();
        if (activitiesResponse.success) {
          const activitiesData = activitiesResponse.data;
          setActivities(
            activitiesData.activities || 
            activitiesData.results || 
            activitiesData.data?.activities || 
            []
          );
        }
      } catch (activitiesError) {
        console.warn('Activities endpoint failed:', activitiesError);
        setActivities([]);
      }

      try {
        const statsResponse = await userAPI.getUserStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        } else {
          setStats(getDefaultStats());
        }
      } catch (statsError) {
        console.warn('Stats endpoint failed:', statsError);
        setStats(getDefaultStats());
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load some profile data. Some features may be limited.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Clean the data before sending
      const cleanData = { ...profileForm };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null) {
          delete cleanData[key];
        }
      });

      const result = await userAPI.updateProfile(cleanData);
      
      if (result.success) {
        await refreshProfile();
        alert('Profile updated successfully!');
      } else {
        setError(result.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // FIXED: Ensure we're sending proper primitive values, not React elements
      const cleanPreferences = {
        price_range_min: preferencesForm.price_range_min ? parseFloat(preferencesForm.price_range_min) : null,
        price_range_max: preferencesForm.price_range_max ? parseFloat(preferencesForm.price_range_max) : null,
        quality_preference: preferencesForm.quality_preference || 'STANDARD',
        preferred_locations: Array.isArray(preferencesForm.preferred_locations) 
          ? preferencesForm.preferred_locations 
          : []
      };

      console.log('📦 Sending preferences:', cleanPreferences);

      const result = await userAPI.updateUserPreferences(cleanPreferences);
      
      if (result.success) {
        alert('Preferences updated successfully!');
      } else {
        setError(result.message || 'Failed to update preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <LoadingSpinner size="large" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-error">
        <Card>
          <div className="error-content">
            <h2>Profile Not Found</h2>
            <p>Unable to load your profile. Please try refreshing the page or contact support.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const profileCompletion = stats?.profile_completion || 0;

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__info">
          <h1>Profile Settings</h1>
          <div className="profile-stats">
            <span className="completion-badge">
              Profile {Math.round(profileCompletion)}% Complete
            </span>
            <span className="verification-badge">
              {userProfile.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="profile__error">
          <Card className="error-card">
            <p>{error}</p>
          </Card>
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'personal', label: 'Personal Info' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'activity', label: 'Activity' },
          { id: 'stats', label: 'Statistics' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="profile__content">
        {activeTab === 'personal' && (
          <div className="personal-info">
            <Card title="Personal Information">
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-grid">
                  <Input
                    label="First Name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                  <Input
                    label="Location"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="form-section">
                  <h4>Farm Information</h4>
                  <div className="form-grid">
                    <Input
                      label="Farm Size (acres)"
                      type="number"
                      step="0.01"
                      value={profileForm.farm_size}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, farm_size: e.target.value }))}
                    />
                    <Input
                      label="Business Name"
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                    />
                  </div>
                  <TextArea
                    label="Business Description"
                    value={profileForm.business_description}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, business_description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="form-section">
                  <h4>Location Coordinates (Optional)</h4>
                  <div className="form-grid">
                    <Input
                      label="Latitude"
                      type="number"
                      step="0.000001"
                      value={profileForm.latitude}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, latitude: e.target.value }))}
                    />
                    <Input
                      label="Longitude"
                      type="number"
                      step="0.000001"
                      value={profileForm.longitude}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, longitude: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button type="submit" variant="primary" loading={saving}>
                    Update Profile
                  </Button>
                </div>
              </form>
            </Card>

            <Card title="Account Information">
              <div className="account-info">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{userProfile.email || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span className="role-badge">{userProfile.role || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Member Since:</label>
                  <span>{userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Last Activity:</label>
                  <span>{userProfile.last_activity ? new Date(userProfile.last_activity).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Login Count:</label>
                  <span>{userProfile.login_count || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences">
            <Card title="Marketplace Preferences">
              <form onSubmit={handlePreferencesUpdate} className="preferences-form">
                <div className="form-section">
                  <h4>Price Range Preferences</h4>
                  <div className="form-grid">
                    <Input
                      label="Minimum Price"
                      type="number"
                      step="0.01"
                      value={preferencesForm.price_range_min}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, price_range_min: e.target.value }))}
                    />
                    <Input
                      label="Maximum Price"
                      type="number"
                      step="0.01"
                      value={preferencesForm.price_range_max}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, price_range_max: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Quality Preferences</h4>
                  <Select
                    label="Preferred Quality Grade"
                    options={[
                      { value: 'PREMIUM', label: 'Premium' },
                      { value: 'STANDARD', label: 'Standard' },
                      { value: 'ECONOMY', label: 'Economy' }
                    ]}
                    value={preferencesForm.quality_preference}
                    onChange={(value) => {
                      // Ensure value is a string, not a React element
                      if (typeof value === 'string') {
                        setPreferencesForm(prev => ({ ...prev, quality_preference: value }));
                      } else if (value && value.target) {
                        // Handle DOM event
                        setPreferencesForm(prev => ({ ...prev, quality_preference: value.target.value }));
                      }
                    }}
                  />
                </div>

                <div className="form-actions">
                  <Button type="submit" variant="primary" loading={saving}>
                    Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity">
            <Card title="Recent Activity">
              {activities.length > 0 ? (
                <div className="activity-list">
                  {activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.activity_type === 'LOGIN' && '🔐'}
                        {activity.activity_type === 'LOGOUT' && '🚪'}
                        {activity.activity_type === 'PROFILE_UPDATE' && '👤'}
                        {!['LOGIN', 'LOGOUT', 'PROFILE_UPDATE'].includes(activity.activity_type) && '📝'}
                      </div>
                      <div className="activity-content">
                        <p>{activity.description || `Activity: ${activity.activity_type}`}</p>
                        <small>
                          {activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Unknown date'}
                          {activity.ip_address && ` • IP: ${activity.ip_address}`}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-activity">
                  <p>No recent activity found</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="statistics">
            <div className="stats-grid">
              <Card title="Farm Statistics">
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-value">{stats.total_farms || 0}</span>
                    <span className="stat-label">Total Farms</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.total_plots || 0}</span>
                    <span className="stat-label">Total Plots</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.active_crops || 0}</span>
                    <span className="stat-label">Active Crops</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.pending_tasks || 0}</span>
                    <span className="stat-label">Pending Tasks</span>
                  </div>
                </div>
              </Card>

              <Card title="Business Statistics">
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-value">{stats.total_orders || 0}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">${stats.total_revenue || 0}</span>
                    <span className="stat-label">Total Revenue</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{Math.round(stats.profile_completion || 0)}%</span>
                    <span className="stat-label">Profile Complete</span>
                  </div>
                </div>
              </Card>
            </div>

            {(userProfile.role === 'FARMER' || !userProfile.role) && (
              <Card title="Performance Metrics">
                <div className="performance-metrics">
                  <div className="metric">
                    <label>Productivity Level</label>
                    <span className={`metric-value productivity-${(stats.productivity_level?.toLowerCase() || 'medium')}`}>
                      {stats.productivity_level || 'Medium'}
                    </span>
                  </div>
                  <div className="metric">
                    <label>Success Rate</label>
                    <span className="metric-value">
                      {stats.success_rate ? `${(stats.success_rate * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="metric">
                    <label>Resource Efficiency</label>
                    <span className="metric-value">
                      {stats.efficiency_score ? `${(stats.efficiency_score * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;