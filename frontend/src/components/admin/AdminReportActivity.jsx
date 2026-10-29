import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

export default function AdminReportActivity() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/report-activity').then(({ data }) => setData(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }, []);

  if (error) return <div className="disclaimer">{error}</div>;
  if (!data) return <p className="muted">Loading report activity…</p>;

  const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Report Activity</h1>
          <div className="muted">Who downloaded or emailed a daily health report, and where it was sent (latest 300)</div>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="card stat"><div className="val">{data.totals.downloads}</div><div className="lbl">Total Downloads</div></div>
        <div className="card stat"><div className="val">{data.totals.emails}</div><div className="lbl">Total Emails Sent</div></div>
      </div>

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Action</th><th>Report date</th><th>Sent to email</th><th>Status</th><th>When</th></tr></thead>
          <tbody>
            {data.logs.length === 0 && <tr><td colSpan={6} className="muted">No reports downloaded or emailed yet.</td></tr>}
            {data.logs.map((l) => (
              <tr key={l._id}>
                <td>{l.user?.name || l.userName || '—'}<div className="muted">{l.user?.phone || l.userPhone}</div></td>
                <td>{l.action === 'email' ? 'Emailed' : 'Downloaded'}</td>
                <td>{l.reportDate}</td>
                <td>{l.action === 'email' ? l.sentToEmail : '—'}</td>
                <td><span className={`badge ${l.success ? 'ok' : 'err'}`} title={l.errorMessage || ''}>{l.success ? 'success' : 'failed'}</span></td>
                <td>{fmt(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
