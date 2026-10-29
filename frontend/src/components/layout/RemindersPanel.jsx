import { useEffect, useRef, useState } from 'react';
import api from '../../api/axiosClient.js';

const TYPES = ['Water', 'Steps', 'Sleep', 'Medication', 'Appointment', 'Custom'];

export default function RemindersPanel() {
  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('Water');
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('08:00');
  const boxRef = useRef(null);

  async function load() {
    try {
      const { data } = await api.get('/reminders');
      setReminders(data);
    } catch {
      setReminders([]);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function addReminder() {
    if (!label.trim()) return;
    await api.post('/reminders', { type, label, time });
    setLabel('');
    setShowForm(false);
    await load();
  }

  async function toggleReminder(id) {
    await api.put(`/reminders/${id}/toggle`);
    await load();
  }

  async function deleteReminder(id) {
    await api.delete(`/reminders/${id}`);
    await load();
  }

  const activeCount = reminders.filter((r) => r.on).length;

  return (
    <div className="dash-top-actions" ref={boxRef}>
      <button className="reminder-btn" onClick={() => setOpen((o) => !o)} aria-label="Reminders">
        🔔
        {activeCount > 0 && <span className="reminder-dot" />}
      </button>

      {open && (
        <div className="reminder-panel">
          <h4>Your reminders</h4>

          {reminders.length === 0 && !showForm && (
            <p className="muted" style={{ marginBottom: 10 }}>No reminders yet — add one to stay on track.</p>
          )}

          {reminders.map((r) => (
            <div key={r._id} className="reminder-item">
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
                <div className="time">{r.time} · {r.type}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`toggle ${r.on ? 'on' : ''}`} onClick={() => toggleReminder(r._id)}><i /></div>
                <button className="del-btn" onClick={() => deleteReminder(r._id)}>✕</button>
              </div>
            </div>
          ))}

          {showForm ? (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div className="field" style={{ marginBottom: 8 }}>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1.3px solid var(--border)' }}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 8 }}>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Drink water" style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1.3px solid var(--border)' }} />
              </div>
              <div className="field" style={{ marginBottom: 10 }}>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1.3px solid var(--border)' }} />
              </div>
              <button className="btn btn-primary btn-block" style={{ padding: 10, fontSize: 13 }} onClick={addReminder}>Save reminder</button>
            </div>
          ) : (
            <button className="btn btn-outline btn-block" style={{ marginTop: 8, padding: 10, fontSize: 13 }} onClick={() => setShowForm(true)}>+ Add reminder</button>
          )}
        </div>
      )}
    </div>
  );
}
