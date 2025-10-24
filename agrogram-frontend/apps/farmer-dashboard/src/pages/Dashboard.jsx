import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '@agro-gram/api';
import { Button, Card, LoadingSpinner } from '@agro-gram/ui';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [farms, setFarms] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Use Promise.allSettled to handle individual API failures gracefully
      const [statsResponse, farmsResponse, activitiesResponse, tasksResponse] = await Promise.allSettled([
        userAPI.getUserStats(),
        userAPI.getFarms(),
        userAPI.getActivities(),
        userAPI.getFarmTasks()
      ]);

      console.log('📊 API Responses:', {
        stats: statsResponse,
        farms: farmsResponse,
        activities: activitiesResponse,
        tasks: tasksResponse
      });

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value?.success) {
        setStats(statsResponse.value.data);
      } else {
        console.warn('⚠️ Stats endpoint not available:', statsResponse.reason);
        setStats(getDefaultStats());
        setErrors(prev => ({ ...prev, stats: 'Stats temporarily unavailable' }));
      }

      // Handle farms response
      if (farmsResponse.status === 'fulfilled' && farmsResponse.value?.success) {
        const farmsData = farmsResponse.value.data;
        setFarms(farmsData.results || farmsData || []);
      } else {
        console.warn('⚠️ Farms endpoint not available:', farmsResponse.reason);
        setFarms([]);
        setErrors(prev => ({ ...prev, farms: 'Farms data temporarily unavailable' }));
      }

      // Handle activities response
      if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value?.success) {
        const activitiesData = activitiesResponse.value.data;
        setRecentActivity(
          activitiesData.activities || 
          activitiesData.results || 
          activitiesData.data?.activities || 
          []
        );
      } else {
        console.warn('⚠️ Activities endpoint not available:', activitiesResponse.reason);
        setRecentActivity([]);
        setErrors(prev => ({ ...prev, activities: 'Activities temporarily unavailable' }));
      }

      // Handle tasks response
      if (tasksResponse.status === 'fulfilled' && tasksResponse.value?.success) {
        const tasksData = tasksResponse.value.data;
        setUpcomingTasks(
          tasksData.tasks || 
          tasksData.results || 
          tasksData || 
          []
        );
      } else {
        console.warn('⚠️ Tasks endpoint not available:', tasksResponse.reason);
        setUpcomingTasks([]);
        setErrors(prev => ({ ...prev, tasks: 'Tasks temporarily unavailable' }));
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Set default data on error
      setStats(getDefaultStats());
      setFarms([]);
      setRecentActivity([]);
      setUpcomingTasks([]);
      setErrors({ general: 'Failed to load dashboard data. Please try refreshing.' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddFarm = () => {
    navigate('/farms?action=create');
  };

  const handleGetRecommendations = () => {
    navigate('/recommendations');
  };

  const handleViewFarm = (farmId) => {
    navigate(`/farms/${farmId}`);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await userAPI.completeFarmTask(taskId);
      if (result.success) {
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Failed to complete task:', result.error);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Farm Dashboard</h1>
        <div className="dashboard__actions">
          <Button variant="primary" onClick={handleAddFarm}>
            Add Farm
          </Button>
          <Button variant="outline" onClick={handleGetRecommendations}>
            Get Recommendations
          </Button>
        </div>
      </div>

      {/* Show general errors */}
      {errors.general && (
        <div className="dashboard__error">
          <p>{errors.general}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="dashboard__stats">
        <Card className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">🏠</div>
            <div className="stat-card__info">
              <h3>{stats?.total_farms || 0}</h3>
              <p>Total Farms</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">🌱</div>
            <div className="stat-card__info">
              <h3>{stats?.active_crops || 0}</h3>
              <p>Active Crops</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">📝</div>
            <div className="stat-card__info">
              <h3>{stats?.pending_tasks || 0}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">✅</div>
            <div className="stat-card__info">
              <h3>{Math.round(stats?.profile_completion || 0)}%</h3>
              <p>Profile Complete</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard__grid">
        {/* Farms Overview */}
        <Card title="My Farms" className="farms-overview">
          {errors.farms && <div className="section-error">{errors.farms}</div>}
          {farms.length > 0 ? (
            <div className="farms-list">
              {farms.slice(0, 3).map(farm => (
                <div key={farm.id} className="farm-item" onClick={() => handleViewFarm(farm.id)}>
                  <div className="farm-item__info">
                    <h4>{farm.name}</h4>
                    <p>{farm.location} • {farm.total_area} acres</p>
                    <small>Soil: {farm.soil_type_display || farm.soil_type || 'Not specified'}</small>
                  </div>
                  <div className="farm-item__stats">
                    <span>{farm.plots_count || farm.plots?.length || 0} plots</span>
                    <span className={`productivity-badge productivity-${farm.productivity_level?.toLowerCase() || 'medium'}`}>
                      {farm.productivity_level || 'Medium'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-farms">
              <p>You don't have any farms yet.</p>
              <Button variant="primary" size="small" onClick={handleAddFarm}>
                Add Your First Farm
              </Button>
            </div>
          )}
          
          {farms.length > 3 && (
            <div className="farms-overview__footer">
              <Button variant="outline" size="small" onClick={() => navigate('/farms')}>
                View All Farms
              </Button>
            </div>
          )}
        </Card>

        {/* Upcoming Tasks */}
        <Card title="Upcoming Tasks" className="tasks-overview">
          {errors.tasks && <div className="section-error">{errors.tasks}</div>}
          {upcomingTasks.length > 0 ? (
            <div className="tasks-list">
              {upcomingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-item__info">
                    <h5>{task.title}</h5>
                    <p>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                    <span className={`priority-badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                      {task.priority_display || task.priority || 'Medium'}
                    </span>
                  </div>
                  <Button 
                    size="small" 
                    variant="outline"
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={task.status === 'COMPLETED'}
                  >
                    {task.status === 'COMPLETED' ? 'Completed' : 'Complete'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tasks">
              <p>No upcoming tasks</p>
            </div>
          )}
          
          {upcomingTasks.length > 5 && (
            <div className="tasks-overview__footer">
              <Button variant="outline" size="small" onClick={() => navigate('/farms')}>
                View All Tasks
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="quick-actions">
        <div className="actions-grid">
          <Button variant="outline" className="action-button" onClick={() => navigate('/farms?action=add-crop')}>
            <span className="action-icon">🌾</span>
            <span>Add Crop</span>
          </Button>
          <Button variant="outline" className="action-button" onClick={() => navigate('/farms?action=analytics')}>
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </Button>
          <Button variant="outline" className="action-button" onClick={() => navigate('/marketplace')}>
            <span className="action-icon">🛒</span>
            <span>Browse Market</span>
          </Button>
          <Button variant="outline" className="action-button" onClick={() => navigate('/recommendations')}>
            <span className="action-icon">🤖</span>
            <span>AI Assistant</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" className="recent-activity">
        {errors.activities && <div className="section-error">{errors.activities}</div>}
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.slice(0, 5).map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.activity_type === 'LOGIN' && '🔐'}
                  {activity.activity_type === 'PROFILE_UPDATE' && '👤'}
                  {activity.activity_type === 'LOGOUT' && '🚪'}
                  {activity.activity_type === 'SECURITY' && '🔒'}
                  {!['LOGIN', 'PROFILE_UPDATE', 'LOGOUT', 'SECURITY'].includes(activity.activity_type) && '📝'}
                </div>
                <div className="activity-content">
                  <p>{activity.description || `Activity: ${activity.activity_type}`}</p>
                  <small>{activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Unknown date'}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-activity">
            <p>No recent activity</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;