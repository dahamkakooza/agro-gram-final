// src/components/shared/DashboardLayout.jsx
import React from 'react';
import NavigationSidebar from './NavigationSidebar';
import HeaderNavigation from './HeaderNavigation';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import './DashboardLayout.css';

const DashboardLayout = ({ children, userRole, currentPage }) => {
  return (
    <div className="dashboard-layout">
      <NavigationSidebar userRole={userRole} currentPage={currentPage} />
      <div className="dashboard-main">
        <HeaderNavigation userRole={userRole} />
        <BreadcrumbNavigation currentPage={currentPage} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;