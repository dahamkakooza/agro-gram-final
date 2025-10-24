import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__main">
          <div className="layout__content">
           `<Outlet />`
           
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;