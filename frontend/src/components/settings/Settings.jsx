import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axiosClient.js';
import LegalContent from '../common/LegalContent.jsx';

const ACTIVITY_LEVELS = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'];
const TIER_LABEL = { free: 'Free', gold: 'Gold', platinum: 'Platinum' };

function calcAge(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  if (isNaN(b)) return null;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age >= 0 ? age : null;
}

function AccordionItem({ icon, label, trailing, isOpen, onToggle, children }) {
  return (
    <div className="settings-item">
      <button className="settings-item-head" onClick={onToggle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--rose-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
          {label}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {trailing}
          <span>{isOpen ? '⌄' : '›'}</span>
        </span>
      </button>
      {isOpen && <div className="settings-item-body">{children}</div>}
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState('');
  const [plans, setPlans] = useState([]);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [weightKg, setWeightKg] = useState(user?.weightKg || '');
  const [heightCm, setHeightCm] = useState(user?.heightCm || '');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'Moderately active');
  const [healthGoal, setHealthGoal] = useState(user?.healthGoal || 'General wellness');
  const [saved, setSaved] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    api.get('/pricing').then(({ data }) => setPlans(data)).catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const [profileError, setProfileError] = useState('');

  async function saveProfile() {
    setProfileError('');
    if (pincode && !/^\d{6}$/.test(String(pincode))) {
      setProfileError('Pincode must be a valid 6-digit number.');
      return;
    }
    try {
      const { data } = await api.put('/auth/profile', { name, email, address, pincode, weightKg, heightCm, activityLevel, healthGoal });
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Could not save your profile.');
    }
  }

  async function handleChangePassword() {
    setPwError('');
    setPwMsg('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Fill in all three fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation don\u2019t match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwBusy(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwMsg('Password updated successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Could not update password.');
    } finally {
      setPwBusy(false);
    }
  }

  const bmi = heightCm && weightKg ? (weightKg / ((heightCm / 100) ** 2)).toFixed(1) : null;
  const currentPlan = plans.find((p) => p.tier === (user?.tier || 'free'));
  const age = calcAge(user?.dob);

  function toggle(key) {
    setOpen((o) => (o === key ? '' : key));
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <AccordionItem icon="👤" label="Profile settings" isOpen={open === 'profile'} onToggle={() => toggle('profile')}>
        <p className="muted" style={{ marginBottom: 14 }}>Update your details any time — this keeps your dashboard, diet plans and predictions accurate.</p>

        {(user?.dob || age !== null) && (
          <div className="profile-stat-row" style={{ marginTop: 0, marginBottom: 18 }}>
            <div className="profile-stat">
              <div className="v" style={{ fontSize: 15 }}>{user?.dob ? new Date(user.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
              <div className="l">Birth date (static)</div>
            </div>
            <div className="profile-stat">
              <div className="v">{age !== null ? age : '—'}</div>
              <div className="l">Age (static)</div>
            </div>
          </div>
        )}

        <div className="field"><label>Full name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid2">
          <div className="field"><label>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Pincode</label><input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" /></div>
        </div>
        <div className="field"><label>Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div className="grid2">
          <div className="field"><label>Weight (kg)</label><input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></div>
          <div className="field"><label>Height (cm)</label><input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></div>
          <div className="field">
            <label>Activity level</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
              {ACTIVITY_LEVELS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Health goal</label>
            <select value={healthGoal} onChange={(e) => setHealthGoal(e.target.value)}>
              <option>General wellness</option><option>Weight management</option><option>PCOS / PCOD support</option><option>Fertility planning</option><option>Better sleep</option><option>Mood tracking</option>
            </select>
          </div>
        </div>
        {bmi && <p className="muted" style={{ marginBottom: 12 }}>Current BMI: <b style={{ color: 'var(--rose-900)' }}>{bmi}</b></p>}
        <button className="btn btn-primary" onClick={saveProfile}>Save changes</button>
        {saved && <span style={{ marginLeft: 12, color: 'var(--sage-700, #4B7A5A)', fontSize: 13 }}>✓ Saved</span>}
      </AccordionItem>

      <AccordionItem
        icon="💳"
        label="Subscription & billing"
        trailing={<span className="muted" style={{ fontSize: 12.5 }}>{TIER_LABEL[user?.tier] || 'Free'} plan</span>}
        isOpen={open === 'billing'}
        onToggle={() => toggle('billing')}
      >
        <p className="muted" style={{ marginBottom: 14 }}>You're currently on the <b style={{ color: 'var(--rose-900)' }}>{currentPlan?.label || 'Free'}</b> plan.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {plans.map((p) => {
            const isCurrent = user && (user.tier || 'free') === p.tier;
            return (
              <div key={p.tier} className={`plan-pick ${isCurrent ? 'current' : ''}`}>
                {isCurrent && <span className="current-tag">Current</span>}
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                <div className="serif" style={{ fontSize: 20 }}>{p.priceINR > 0 ? `₹${p.priceINR}/mo` : 'Free'}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{p.monthlyTokens === -1 ? 'Unlimited tokens' : `${p.monthlyTokens} tokens/mo`}</div>
              </div>
            );
          })}
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate('/subscription')}>
          Change plan
        </button>
      </AccordionItem>

      <AccordionItem icon="🔒" label="Privacy & security" isOpen={open === 'privacy'} onToggle={() => toggle('privacy')}>
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Change password</h3>
          <p className="muted" style={{ marginBottom: 14 }}>Update the password you use to sign in.</p>
          <div className="field"><label>Current password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div className="grid2">
            <div className="field"><label>New password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="field"><label>Confirm new password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
          </div>
          {pwError && <div className="error-text">{pwError}</div>}
          {pwMsg && <div style={{ fontSize: 12.5, color: 'var(--sage-700, #4B7A5A)', marginBottom: 10 }}>✓ {pwMsg}</div>}
          <button className="btn btn-primary" disabled={pwBusy} onClick={handleChangePassword}>{pwBusy ? 'Updating…' : 'Update password'}</button>
        </div>

        <LegalContent />
      </AccordionItem>

      <AccordionItem icon="🎛️" label="App preferences" isOpen={open === 'prefs'} onToggle={() => toggle('prefs')}>
        <p className="muted">More app preferences (notifications, units, theme) are coming soon.</p>
      </AccordionItem>

      <button onClick={handleLogout} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', color: 'var(--red-600)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--red-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↪</span>
          Log out
        </span>
        <span>›</span>
      </button>
    </div>
  );
}
