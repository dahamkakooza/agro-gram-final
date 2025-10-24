import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requiredPermission = null 
}) => {
  const { user, userProfile, loading, isRouteAllowed, hasPermission, getRoleDashboard } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  const userRole = userProfile?.role;

  // Check route access
  if (!isRouteAllowed(location.pathname)) {
    const userDashboard = getRoleDashboard();
    console.log(`🚫 Access denied for ${userRole} to ${location.pathname}. Redirecting to ${userDashboard}`);
    return <Navigate to={userDashboard} replace />;
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    const userDashboard = getRoleDashboard();
    console.log(`🚫 Role requirement not met. Required: ${requiredRole}, User: ${userRole}. Redirecting to ${userDashboard}`);
    return <Navigate to={userDashboard} replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const userDashboard = getRoleDashboard();
    console.log(`🚫 Permission required: ${requiredPermission}. User: ${userRole}. Redirecting to ${userDashboard}`);
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;