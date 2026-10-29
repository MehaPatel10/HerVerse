import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import Logo from './Logo.jsx';

function timeLeft(endAt) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function CountdownScreen({ status, onExpired }) {
  const [left, setLeft] = useState(() => timeLeft(status.endAt));

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = timeLeft(status.endAt);
      setLeft(remaining);
      if (!remaining) onExpired();
    }, 1000);
    return () => clearInterval(id);
  }, [status.endAt, onExpired]);

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card" style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Logo to={null} light showWordmark={false} size={26} />
        </div>
        <div className="serif" style={{ color: '#fff', fontSize: 22, marginBottom: 10 }}>We'll be right back</div>
        <p className="muted" style={{ color: '#E2C4D1', marginBottom: 26 }}>{status.message}</p>

        {left ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 10 }}>
            {[['Days', left.days], ['Hrs', left.hours], ['Min', left.minutes], ['Sec', left.seconds]].map(([label, val]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', minWidth: 58 }}>
                <div className="serif" style={{ fontSize: 24, color: '#fff' }}>{String(val).padStart(2, '0')}</div>
                <div style={{ fontSize: 10.5, color: '#C99FB0', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ color: '#fff' }}>Wrapping up — refresh in a moment.</p>
        )}
      </div>
    </div>
  );
}

export default function MaintenanceGate({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [checked, setChecked] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  async function refreshStatus() {
    try {
      const { data } = await api.get('/maintenance');
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setChecked(true);
    }
  }

  useEffect(() => {
    if (isAdminRoute) { setChecked(true); return; }
    refreshStatus();
    const poll = setInterval(refreshStatus, 30000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminRoute]);

  // Admin routes are never gated - admins need access to turn maintenance
  // off even while it's active. For everything else, render the app right
  // away (avoids a blank flash on every normal load) and only swap to the
  // countdown once the status check confirms maintenance is actually live.
  if (isAdminRoute) return children;

  if (checked && status?.isActive) {
    return <CountdownScreen status={status} onExpired={refreshStatus} />;
  }

  return children;
}
