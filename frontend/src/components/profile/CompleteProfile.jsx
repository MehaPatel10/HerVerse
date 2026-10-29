import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

const GOALS = ['General wellness', 'Weight management', 'PCOS / PCOD support', 'Fertility planning', 'Better sleep', 'Mood tracking'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'];

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

function calcBMI(heightCm, weightKg) {
  const h = Number(heightCm), w = Number(weightKg);
  if (!h || !w) return null;
  const m = h / 100;
  return (w / (m * m)).toFixed(1);
}

function bmiLabel(bmi) {
  if (!bmi) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Overweight';
  return 'Obese range';
}

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.name || '');
  const [dob, setDob] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderately active');
  const [healthGoal, setHealthGoal] = useState('General wellness');
  const navigate = useNavigate();

  const age = useMemo(() => calcAge(dob), [dob]);
  const bmi = useMemo(() => calcBMI(heightCm, weightKg), [heightCm, weightKg]);

  async function handleContinue() {
    try {
      const { data } = await api.put('/auth/profile', {
        name: fullName || undefined,
        dob: dob || undefined,
        heightCm: heightCm || undefined,
        weightKg: weightKg || undefined,
        activityLevel,
        healthGoal,
        healthGoals: [healthGoal]
      });
      updateUser(data);
    } catch (err) {
      console.warn('Profile update failed:', err.message);
    }
    navigate('/dashboard');
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 80px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Let's complete your profile</h1>
      <p className="muted" style={{ marginBottom: 30 }}>This helps LUNA and your dashboard personalize predictions and diet plans.</p>

      <div className="field">
        <label>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
      </div>

      <div className="grid2">
        <div className="field"><label>Date of birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
        <div className="field"><label>Weight (kg)</label><input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="60" /></div>
        <div className="field"><label>Height (cm)</label><input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="160" /></div>
        <div className="field">
          <label>Activity level</label>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
            {ACTIVITY_LEVELS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {(age !== null || bmi) && (
        <div className="profile-stat-row">
          {age !== null && (
            <div className="profile-stat"><div className="v">{age}</div><div className="l">Age (auto)</div></div>
          )}
          {bmi && (
            <>
              <div className="profile-stat"><div className="v">{bmi}</div><div className="l">BMI (auto)</div></div>
              <div className="profile-stat"><div className="v" style={{ fontSize: 14 }}>{bmiLabel(bmi)}</div><div className="l">BMI range</div></div>
            </>
          )}
        </div>
      )}

      <div style={{ fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', color: 'var(--rose-600)', margin: '24px 0 12px' }}>Primary health goal</div>
      <div className="chips">
        {GOALS.map((g) => (
          <div key={g} className={`chip ${healthGoal === g ? 'sel' : ''}`} onClick={() => setHealthGoal(g)}>{g}</div>
        ))}
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 30 }} onClick={handleContinue}>
        Go to my dashboard
      </button>
    </div>
  );
}
