// src/components/shared/NavigationSidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavigationSidebar.css';

const NavigationSidebar = ({ userRole, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleBasedNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: '🏠 Dashboard', icon: 'home' }
    ];

    const roleItems = {
      FINANCIAL_ADVISOR: [
        { path: '/financial/portfolio', label: '💰 Portfolio', icon: 'portfolio' },
        { path: '/loans/applications', label: '📝 Loan Applications', icon: 'applications' },
        { path: '/risk/assessment', label: '⚖️ Risk Assessment', icon: 'risk' },
        { path: '/collateral/valuation', label: '🏠 Collateral', icon: 'collateral' },
        { path: '/products/financial', label: '💳 Products', icon: 'products' },
        { path: '/analytics/impact', label: '📈 Impact Analytics', icon: 'analytics' }
      ],
      TECHNICAL_ADVISOR: [
        { path: '/cases/manage', label: '📋 Cases', icon: 'cases' },
        { path: '/diagnosis/remote', label: '🔧 Diagnosis', icon: 'diagnosis' },
        { path: '/knowledge/base', label: '📚 Knowledge', icon: 'knowledge' },
        { path: '/visits/field', label: '🌾 Field Visits', icon: 'visits' },
        { path: '/impact/measurement', label: '📊 Impact', icon: 'impact' },
        { path: '/learning/continuous', label: '🎓 Learning', icon: 'learning' }
      ],
      LEGAL_SPECIALIST: [
        { path: '/cases/legal', label: '⚖️ Cases', icon: 'cases' },
        { path: '/compliance/hub', label: '📜 Compliance', icon: 'compliance' },
        { path: '/documents/legal', label: '📂 Documents', icon: 'documents' },
        { path: '/disputes/resolution', label: '🤝 Disputes', icon: 'disputes' },
        { path: '/contracts/templates', label: '📄 Templates', icon: 'templates' },
        { path: '/analytics/legal', label: '📊 Analytics', icon: 'analytics' }
      ],
      MARKET_ANALYST: [
        { path: '/market/intelligence', label: '🌍 Market Intel', icon: 'intel' },
        { path: '/prices/analysis', label: '💰 Price Analysis', icon: 'prices' },
        { path: '/competitors/analysis', label: '🏢 Competitors', icon: 'competitors' },
        { path: '/reports/automated', label: '📊 Reports', icon: 'reports' },
        { path: '/alerts/configure', label: '🚨 Alerts', icon: 'alerts' },
        { path: '/analytics/performance', label: '📈 Performance', icon: 'performance' }
      ]
    };

    return [...baseItems, ...(roleItems[userRole] || [])];
  };

  const navItems = getRoleBasedNavItems();

  return (
    <nav className="navigation-sidebar">
      <div className="sidebar-header">
        <h2>AgroGram</h2>
        <div className="user-role-badge">{userRole?.replace('_', ' ')}</div>
      </div>
      <ul className="nav-items">
        {navItems.map(item => (
          <li key={item.path} className="nav-item">
            <button
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationSidebar;