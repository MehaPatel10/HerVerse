import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient.js';

// Line chart of total visits per day (today + previous 10 days), drawn as plain SVG.
function VisitsChart({ data }) {
  const W = 640, H = 240, padL = 40, padR = 16, padT = 20, padB = 36;
  const max = Math.max(5, ...data.map((d) => d.visits));
  const niceMax = Math.ceil(max / 5) * 5;
  const x = (i) => padL + (i * (W - padL - padR)) / Math.max(1, data.length - 1);
  const y = (v) => padT + (1 - v / niceMax) * (H - padT - padB);
  const points = data.map((d, i) => `${x(i)},${y(d.visits)}`).join(' ');
  const ticks = [0, 1, 2, 3, 4].map((t) => Math.round((niceMax * t) / 4));
  const label = (key) => {
    const d = new Date(`${key}T12:00:00`);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Website visits per day for the last 10 days and today">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#F0C7D6" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#8A6B76">{t}</text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke="#B23A63" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.date}>
          <circle cx={x(i)} cy={y(d.visits)} r={i === data.length - 1 ? 5 : 3.5} fill={i === data.length - 1 ? '#B23A63' : '#fff'} stroke="#B23A63" strokeWidth="2">
            <title>{`${label(d.date)}: ${d.visits} visit${d.visits === 1 ? '' : 's'}`}</title>
          </circle>
          <text x={x(i)} y={y(d.visits) - 10} fontSize="11" textAnchor="middle" fill="#3A2A30">{d.visits}</text>
          <text x={x(i)} y={H - 12} fontSize="10.5" textAnchor="middle" fill="#8A6B76">{i === data.length - 1 ? 'Today' : label(d.date)}</text>
        </g>
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }, []);

  if (error) return <div className="disclaimer">{error}</div>;
  if (!stats) return <p className="muted">Loading dashboard…</p>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Admin Dashboard</h1>
          <div className="muted">Live overview of users, revenue and AI usage</div>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="card stat">
          <div className="val">{stats.totalUsers}</div>
          <div className="lbl">Total Users</div>
        </div>
        <div className="card stat">
          <div className="val">₹{stats.monthlyRevenueINR.toLocaleString('en-IN')}</div>
          <div className="lbl">Monthly Revenue (active plans)</div>
        </div>
        <div className="card stat">
          <div className="val">{stats.groqKeysConfigured}</div>
          <div className="lbl">Groq Keys Configured</div>
        </div>
        <div className="card stat">
          <div className="val">{stats.aiMessages.authenticatedToday + stats.aiMessages.publicDemoToday}</div>
          <div className="lbl">AI Messages Today</div>
        </div>
      </div>

      <div className="card admin-panel">
        <h2>Website Visits — last 10 days &amp; today</h2>
        <div className="muted" style={{ marginBottom: 8 }}>Every visit is counted, including repeat visits by the same person</div>
        <VisitsChart data={stats.visitsTrend || []} />
      </div>

      <div className="two-col">
        <div className="card admin-panel">
          <h2>Users by Tier</h2>
          <div className="list-row"><span className="badge free">Free</span><span>{stats.usersByTier.free}</span></div>
          <div className="list-row"><span className="badge gold">Gold</span><span>{stats.usersByTier.gold}</span></div>
          <div className="list-row"><span className="badge platinum">Platinum</span><span>{stats.usersByTier.platinum}</span></div>
        </div>

        <div className="card admin-panel">
          <h2>AI Usage Today</h2>
          <div className="list-row"><span>Authenticated messages</span><span>{stats.aiMessages.authenticatedToday}</span></div>
          <div className="list-row"><span>Public demo messages</span><span>{stats.aiMessages.publicDemoToday}</span></div>
          <div className="list-row"><span>Failures</span><span className={stats.aiMessages.failuresToday > 0 ? 'badge err' : 'badge ok'}>{stats.aiMessages.failuresToday}</span></div>
          <div className="list-row"><span>All-time messages</span><span>{stats.aiMessages.allTime}</span></div>
          <Link to="/admin/groq" className="btn btn-outline btn-block" style={{ marginTop: 8 }}>View Groq Key Details →</Link>
        </div>
      </div>
    </div>
  );
}
