import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          className="dashboard-logout-btn"
        >
          Logout
        </button>
      </div>
      <p className="dashboard-welcome">Welcome to the dashboard, {user?.email}!</p>

      <div className="dashboard-content">
        <div className="placeholder-content">
          <h2>Your dashboard is ready!</h2>
          <p>Speed test features will be available on the home page soon.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
