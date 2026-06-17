import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(0);
  const [meterType, setMeterType] = useState('download');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const phases = [
      {
        type: 'download',
        values: [0, 250, 500, 92.48, 1000, 0],
      },
      {
        type: 'upload',
        values: [0, 40, 120, 28.64, 300, 0],
      },
    ];

    let phaseIndex = 0;
    let valueIndex = 0;

    setMeterType(phases[0].type);
    setSpeed(phases[0].values[0]);

    const interval = setInterval(() => {
      const currentPhase = phases[phaseIndex];

      if (!currentPhase) {
        return;
      }

      if (valueIndex < currentPhase.values.length) {
        setMeterType(currentPhase.type);
        setSpeed(currentPhase.values[valueIndex]);
        valueIndex += 1;
        return;
      }

      if (phaseIndex < phases.length - 1) {
        phaseIndex += 1;
        valueIndex = 0;
        setMeterType(phases[phaseIndex].type);
        setSpeed(phases[phaseIndex].values[0]);
        valueIndex = 1;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
        <SpeedMeter value={speed} type={meterType} />
      </div>
    </div>
  );
}

export default Dashboard;
