import { useEffect, useState, createContext, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axiosClient.js';
import Logo from '../common/Logo.jsx';
import PublicFooter from '../common/PublicFooter.jsx';
import RemindersPanel from './RemindersPanel.jsx';

// Shared "today's health data" context so every page (Overview, Health
// Tracker, etc.) reads/writes the same numbers without prop-drilling.
const HealthDataContext = createContext(null);
export function useHealthData() {
  return useContext(HealthDataContext);
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [periodPrediction, setPeriodPrediction] = useState(null);

  async function refreshHealth() {
    const { data } = await api.get('/health/today');
    setHealth(data);
  }
  async function refreshPeriod() {
    const { data } = await api.get('/period');
    setPeriodPrediction(data.prediction);
  }

  useEffect(() => {
    refreshHealth();
    refreshPeriod();
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '▦', end: true },
    { to: '/dashboard/period', label: 'Period tracker', icon: '🌙' },
    { to: '/dashboard/luna', label: 'AI assistant', icon: '💬' },
    { to: '/dashboard/diet', label: 'Diet planner', icon: '🥗' },
    { to: '/dashboard/health', label: 'Health tracker', icon: '📈' },
    { to: '/dashboard/doctors', label: 'Doctors & hospitals', icon: '🩺' },
    { to: '/dashboard/emergency', label: 'Emergency', icon: '🚑', emergency: true },
    { to: '/dashboard/reports', label: 'Reports', icon: '🧾' },
    { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <HealthDataContext.Provider value={{ health, refreshHealth, periodPrediction, refreshPeriod }}>
      <div className="dash">
        <aside className="sidebar">
          <Logo to="/" light />
          <nav className="side-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `${isActive ? 'active' : ''} ${item.emergency ? 'emergency' : ''}`}
              >
                <span>{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={handleLogout} style={{ color: '#E2C4D1', padding: '11px 13px', display: 'flex', gap: 12 }}>
            ↪ Log out
          </button>
        </aside>

        <main className="dash-main">
          <div className="dash-top">
            <div>
              <h1 style={{ fontSize: 23 }}>Hi, {user?.name?.split(' ')[0] || 'there'}</h1>
              <div className="muted">Here's how your body's doing today</div>
            </div>
            <RemindersPanel />
          </div>

          {health && (
            <div className="stat-bar">
              <div className="stat card">
                <div className="val">{periodPrediction ? `${Math.max(0, Math.round((new Date(periodPrediction.nextPeriod) - new Date()) / 86400000))} days` : '—'}</div>
                <div className="lbl">Next period{periodPrediction ? ` · ${new Date(periodPrediction.nextPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</div>
              </div>
              <div className="stat card">
                <div className="val">{health.log.waterLitres} / {health.goals.WATER_GOAL} L</div>
                <div className="lbl">Water intake</div>
              </div>
              <div className="stat card">
                <div className="val">{health.log.sleepLogged ? `${Math.floor(health.log.sleepMinutes / 60)}h ${health.log.sleepMinutes % 60}m` : 'Not logged'}</div>
                <div className="lbl">Sleep last night</div>
              </div>
              <div className="stat card">
                <div className="val">{health.log.steps.toLocaleString()}</div>
                <div className="lbl">Steps today</div>
              </div>
              <div className="stat card">
                <div className="val">{health.log.weightLogged ? `${health.log.weightKg} kg` : '—'}</div>
                <div className="lbl">Weight</div>
              </div>
              <div className="stat card">
                <div className="ring-wrap">
                  <div className="ring" style={{ background: `conic-gradient(var(--sage-600) 0% ${health.healthScore}%, var(--rose-100) ${health.healthScore}% 100%)` }}>
                    <i>{health.healthScore}</i>
                  </div>
                  <div>
                    <div className="val" style={{ fontSize: 15 }}>{health.healthScore} / 100</div>
                    <div className="lbl">Health score</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
      <PublicFooter />
    </HealthDataContext.Provider>
  );
}
