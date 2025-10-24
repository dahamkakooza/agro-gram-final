import React from 'react';
import './UserManagement.css';

const UserManagement = ({ users, onUserAction }) => {
  return (
    <div className="user-management">
      <h4>User Management</h4>
      <div className="users-table">
        {users?.map(user => (
          <div key={user.id} className="user-row">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <div className="user-status">
              <span className={`status ${user.status}`}>{user.status}</span>
            </div>
            <div className="user-actions">
              <button 
                className="action-btn edit"
                onClick={() => onUserAction(user, 'edit')}
              >
                Edit
              </button>
              <button 
                className="action-btn delete"
                onClick={() => onUserAction(user, 'delete')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;