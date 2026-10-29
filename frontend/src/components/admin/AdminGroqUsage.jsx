import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

export default function AdminGroqUsage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/admin/groq-usage').then(({ data }) => setData(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }

  useEffect(() => { load(); }, []);

  if (error) return <div className="disclaimer">{error}</div>;
  if (!data) return <p className="muted">Loading Groq usage…</p>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Groq API Key Rotation</h1>
          <div className="muted">{data.configuredKeyCount} key(s) configured in GROQ_API_KEYS — the app automatically rotates and skips any key that is rate-limited or erroring.</div>
        </div>
        <button className="btn btn-outline" onClick={load}>Refresh</button>
      </div>

      <div className="card admin-panel">
        <h2>Key Status</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th><th>Preview</th><th>Status</th><th>Success</th><th>Errors</th><th>Rate Limits</th><th>Last Used</th><th>Last Error</th>
            </tr>
          </thead>
          <tbody>
            {data.keys.length === 0 && (
              <tr><td colSpan={8} className="muted">No key usage recorded yet — send a Luna message to generate the first entry.</td></tr>
            )}
            {data.keys.map((k) => {
              const onCooldown = k.cooldownUntil && new Date(k.cooldownUntil) > new Date();
              return (
                <tr key={k.label}>
                  <td>{k.label}</td>
                  <td className="muted">{k.keyPreview}</td>
                  <td>
                    {!k.isActive ? <span className="badge err">Disabled</span> : onCooldown ? <span className="badge err">Cooldown</span> : <span className="badge ok">Active</span>}
                  </td>
                  <td>{k.successCount}</td>
                  <td>{k.errorCount}</td>
                  <td>{k.rateLimitCount}</td>
                  <td className="muted">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}</td>
                  <td className="muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={k.lastError}>{k.lastError || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card admin-panel">
        <h2>Recent Failures (last 20)</h2>
        <table className="admin-table">
          <thead><tr><th>When</th><th>Key</th><th>Source</th><th>Error</th></tr></thead>
          <tbody>
            {data.recentFailures.length === 0 && <tr><td colSpan={4} className="muted">No failures recorded. 🎉</td></tr>}
            {data.recentFailures.map((f) => (
              <tr key={f._id}>
                <td className="muted">{new Date(f.createdAt).toLocaleString()}</td>
                <td>{f.keyLabel}</td>
                <td>{f.source === 'public_demo' ? 'Public demo' : 'Authenticated'}</td>
                <td className="muted">{f.errorMessage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
