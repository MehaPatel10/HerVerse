import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminMaintenance() {
  const [enabled, setEnabled] = useState(false);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function load() {
    api.get('/admin/maintenance').then(({ data }) => {
      setEnabled(data.enabled);
      setStartAt(toLocalInputValue(data.startAt));
      setEndAt(toLocalInputValue(data.endAt));
      setMessage(data.message || '');
      setIsActive(data.isActive);
    });
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      const { data } = await api.put('/admin/maintenance', {
        enabled,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
        message
      });
      setIsActive(data.isActive);
      setMsg('Maintenance settings saved.');
      setTimeout(() => setMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function turnOffNow() {
    setSaving(true);
    try {
      const { data } = await api.put('/admin/maintenance', { enabled: false });
      setEnabled(false);
      setIsActive(data.isActive);
      setMsg('Maintenance turned off - the site is live again.');
      setTimeout(() => setMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Website Maintenance</h1>
          <div className="muted">Schedule a window during which regular users see a countdown instead of the app. This never affects the admin panel.</div>
        </div>
      </div>

      {msg && <div className="card" style={{ background: 'var(--sage-100, #E4F0E6)', border: 'none', marginBottom: 16 }}>{msg}</div>}

      <div className="card admin-panel" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Maintenance mode</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{isActive ? '🔴 Currently live for users' : enabled ? '🟡 Enabled, but outside the scheduled window' : '⚪ Off'}</div>
          </div>
          <div className={`toggle ${enabled ? 'on' : ''}`} onClick={() => setEnabled((e) => !e)}><i /></div>
        </div>

        <div className="grid2">
          <div className="field"><label>Starts at</label><input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} /></div>
          <div className="field"><label>Ends at</label><input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Message shown to users</label>
          <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.3px solid var(--border)', fontFamily: 'inherit' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save schedule'}</button>
          {isActive && <button className="btn btn-outline" disabled={saving} onClick={turnOffNow}>Turn off now</button>}
        </div>
      </div>
    </div>
  );
}
