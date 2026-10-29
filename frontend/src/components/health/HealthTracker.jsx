import { useState, useEffect } from 'react';
import api from '../../api/axiosClient.js';
import { useHealthData } from '../layout/DashboardLayout.jsx';

export default function HealthTracker() {
  const { health, refreshHealth } = useHealthData();
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [showStepsForm, setShowStepsForm] = useState(false);
  const [stepsAdd, setStepsAdd] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [trendMsg, setTrendMsg] = useState('');

  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [rType, setRType] = useState('Water');
  const [rLabel, setRLabel] = useState('');
  const [rTime, setRTime] = useState('09:00');
  const [rError, setRError] = useState('');

  async function loadReminders() {
    const { data } = await api.get('/reminders');
    setReminders(data);
  }
  useEffect(() => { loadReminders(); }, []);

  async function saveSleep() {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    if (h === 0 && m === 0) return;
    await api.put('/health/sleep', { hours: h, minutes: m });
    setHours(''); setMinutes(''); setShowSleepForm(false);
    await refreshHealth();
  }

  async function saveSteps() {
    const add = parseInt(stepsAdd, 10) || 0;
    if (add <= 0) return;
    await api.put('/health/steps', { add });
    setStepsAdd(''); setShowStepsForm(false);
    await refreshHealth();
  }

  async function addGlass() {
    await api.put('/health/water');
    await refreshHealth();
  }

  async function saveWeight() {
    const w = parseFloat(weightInput);
    if (!w || w < 20 || w > 200) return;
    const { data } = await api.put('/health/weight', { weightKg: w });
    setTrendMsg(data.trendDiff === 0 ? 'No change since last log' : data.trendDiff < 0 ? `↓ ${Math.abs(data.trendDiff)} kg since last log` : `↑ ${data.trendDiff} kg since last log`);
    setWeightInput(''); setShowWeightForm(false);
    await refreshHealth();
  }

  async function toggleReminder(id) {
    await api.put(`/reminders/${id}/toggle`);
    await loadReminders();
  }
  async function deleteReminder(id) {
    await api.delete(`/reminders/${id}`);
    await loadReminders();
  }
  async function addReminder() {
    if (!rLabel || !rTime) { setRError('Add a label and time for your reminder.'); return; }
    setRError('');
    await api.post('/reminders', { type: rType, label: rLabel, time: rTime });
    setRLabel(''); setShowReminderForm(false);
    await loadReminders();
  }

  if (!health) return <p className="muted">Loading...</p>;
  const { log, goals } = health;

  return (
    <div className="two-col" style={{ alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 20 }}>😴</div><h3>Sleep</h3>
            <p className="muted">{log.sleepLogged ? `${Math.floor(log.sleepMinutes / 60)}h ${log.sleepMinutes % 60}m` : 'Not logged yet'} · goal 8h</p>
            <div className="track-bar"><div className="track-fill" style={{ width: `${Math.min(100, Math.round((log.sleepMinutes / goals.SLEEP_GOAL_MIN) * 100))}%`, background: 'var(--gold-600)' }} /></div>
            <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={() => setShowSleepForm(!showSleepForm)}>Log sleep</button>
            {showSleepForm && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hrs" style={{ width: 70, padding: 8 }} />
                <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Min" style={{ width: 70, padding: 8 }} />
                <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={saveSleep}>Save</button>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 20 }}>👟</div><h3>Steps</h3>
            <p className="muted">{log.steps.toLocaleString()} of {goals.STEPS_GOAL.toLocaleString()}</p>
            <div className="track-bar"><div className="track-fill" style={{ width: `${Math.min(100, Math.round((log.steps / goals.STEPS_GOAL) * 100))}%`, background: 'var(--sage-600)' }} /></div>
            <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={() => setShowStepsForm(!showStepsForm)}>+ Add steps</button>
            {showStepsForm && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input type="number" value={stepsAdd} onChange={(e) => setStepsAdd(e.target.value)} placeholder="Steps" style={{ width: 90, padding: 8 }} />
                <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={saveSteps}>Save</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 20 }}>💧</div><h3>Water intake</h3>
            <p className="muted">{log.waterLitres}L of {goals.WATER_GOAL}L</p>
            <div className="track-bar"><div className="track-fill" style={{ width: `${Math.min(100, Math.round((log.waterLitres / goals.WATER_GOAL) * 100))}%`, background: 'var(--lav-600)' }} /></div>
            <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={addGlass}>+ Add glass (250ml)</button>
          </div>

          <div className="card">
            <div style={{ fontSize: 20 }}>⚖️</div><h3>Weight</h3>
            <p className="muted">{log.weightLogged ? `${log.weightKg} kg` : 'Not logged today'}</p>
            {trendMsg && <p style={{ fontSize: 11.5, color: 'var(--sage-600)', marginTop: 2 }}>{trendMsg}</p>}
            <button className="btn btn-outline" style={{ marginTop: 10, padding: '8px 14px', fontSize: 12.5 }} onClick={() => setShowWeightForm(!showWeightForm)}>Log weight</button>
            {showWeightForm && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="kg" step="0.1" style={{ width: 90, padding: 8 }} />
                <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={saveWeight}>Save</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Reminders</h3>
        <p className="muted" style={{ marginBottom: 16 }}>Stay on top of water, steps, sleep, medication and appointments.</p>
        {reminders.map((r) => (
          <div key={r._id} className="list-row">
            <div>
              <div style={{ fontSize: 13.5, color: 'var(--rose-900)' }}>{r.label}</div>
              <div className="muted">{r.type} · {r.time}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={r.on} onChange={() => toggleReminder(r._id)} />
              <button className="del-btn" onClick={() => deleteReminder(r._id)}>✕</button>
            </div>
          </div>
        ))}

        <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => setShowReminderForm(!showReminderForm)}>+ Add reminder</button>
        {showReminderForm && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div className="grid2">
              <div className="field">
                <label>Type</label>
                <select value={rType} onChange={(e) => setRType(e.target.value)}>
                  <option>Water</option><option>Steps</option><option>Sleep</option><option>Medication</option><option>Appointment</option><option>Custom</option>
                </select>
              </div>
              <div className="field"><label>Time</label><input type="time" value={rTime} onChange={(e) => setRTime(e.target.value)} /></div>
            </div>
            <div className="field"><label>Label</label><input value={rLabel} onChange={(e) => setRLabel(e.target.value)} placeholder="e.g. Drink a glass of water" /></div>
            {rError && <div className="error-text">{rError}</div>}
            <button className="btn btn-primary" onClick={addReminder}>Save reminder</button>
          </div>
        )}
      </div>
    </div>
  );
}
