// D:\agro-gram\agrogram-frontend\apps\farmer-dashboard\src\components\layout\RoleBasedNavigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedNavigation = () => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const userRole = userProfile?.role;

  const navigationItems = {
    FARMER: [
      { name: 'Dashboard', path: '/dashboard', icon: '📊' },
      { name: 'My Farms', path: '/farms', icon: '🏠' },
      { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
      { name: 'Sell Product', path: '/marketplace/sell', icon: '📦' },
      { name: 'Crop AI', path: '/ai/crop-recommendation', icon: '🌱' },
      { name: 'Price AI', path: '/ai/price-prediction', icon: '💹' }
    ],
    CONSUMER: [
      { name: 'Dashboard', path: '/dashboard', icon: '📊' },
      { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
      { name: 'My Cart', path: '/cart', icon: '🛍️' },
      { name: 'Price Alerts', path: '/ai/price-prediction', icon: '🔔' },
      { name: 'Shopping AI', path: '/ai/assistant', icon: '🤖' }
    ],
    SUPPLIER: [
      { name: 'Dashboard', path: '/dashboard', icon: '📊' },
      { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
      { name: 'Sell Product', path: '/marketplace/sell', icon: '📦' },
      { name: 'Inventory', path: '/marketplace/inventory', icon: '📋' },
      { name: 'Business AI', path: '/ai/assistant', icon: '📈' },
      { name: 'Price Analytics', path: '/ai/price-prediction', icon: '💹' }
    ],
    ADMIN: [
      { name: 'Dashboard', path: '/dashboard', icon: '📊' },
      { name: 'Users', path: '/admin/users', icon: '👥' },
      { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
      { name: 'Farms', path: '/farms', icon: '🏠' },
      { name: 'Analytics', path: '/admin/analytics', icon: '📈' }
    ],
    AGENT: [
      { name: 'Dashboard', path: '/dashboard', icon: '📊' },
      { name: 'Farmers', path: '/agent/farmers', icon: '👨‍🌾' },
      { name: 'Recommendations', path: '/ai/crop-recommendation', icon: '🌱' },
      { name: 'Market Insights', path: '/ai/price-prediction', icon: '💹' }
    ]
  };

  const items = navigationItems[userRole] || [];
  const displayName = userProfile?.first_name || userProfile?.email || 'User';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-green-600 text-xl font-bold">🌱 Agro-Gram</span>
            </Link>
          </div>

          <div className="flex space-x-8">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-green-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {userRole?.toLowerCase()}
              </span>
              <span className="text-sm text-gray-700">
                Hello, {displayName}
              </span>
            </div>
            <Link
              to="/profile"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;