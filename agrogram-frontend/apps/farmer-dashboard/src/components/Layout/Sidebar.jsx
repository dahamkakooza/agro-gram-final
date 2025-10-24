import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/farms', label: 'My Farms', icon: '🏠' },
    { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { path: '/recommendations', label: 'AI Assistant', icon: '🤖' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="sidebar">
      <ul className="sidebar__nav">
        {navItems.map((item) => (
          <li key={item.path} className="sidebar__item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;