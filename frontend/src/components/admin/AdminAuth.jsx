import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../common/Logo.jsx';

export default function AdminAuth() {
  const { user, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in as an admin - skip straight past the login screen.
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!phone || !password) {
      setError('Enter both phone number and password.');
      return;
    }
    setBusy(true);
    try {
      await adminLogin({ phone, password });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div style={{ marginBottom: 6 }}><Logo to={null} light showWordmark={false} size={22} /></div>
        <div className="serif" style={{ color: '#fff', fontSize: 22, marginBottom: 4 }}>herverse admin</div>
        <p className="muted" style={{ color: '#C99FB0', marginBottom: 28 }}>
          Internal panel access only. This is a separate login from the HERVERSE client app.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label style={{ color: '#E2C4D1' }}>Admin phone number</label>
            <input
              className="admin-auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9999999999"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label style={{ color: '#E2C4D1' }}>Password</label>
            <input
              className="admin-auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-text" style={{ color: '#F4B3AC' }}>{error}</div>}

          <button className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: 6 }}>
            {busy ? 'Signing in…' : 'Sign in to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
