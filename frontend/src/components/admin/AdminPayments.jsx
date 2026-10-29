import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

const STATUS_BADGE = { paid: 'ok', created: 'gold', failed: 'err' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [cleaning, setCleaning] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState('');

  function loadPayments() {
    api.get('/admin/payments').then(({ data }) => setPayments(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }

  useEffect(() => { loadPayments(); }, []);

  async function handleCleanup() {
    setCleaning(true);
    setCleanupMsg('');
    try {
      const { data } = await api.post('/admin/cleanup-orphaned-data');
      const total = Object.values(data.removed || {}).reduce((a, b) => a + b, 0);
      setCleanupMsg(total > 0 ? `Removed ${total} orphaned record(s) left behind by earlier user deletions.` : 'No orphaned records found — everything is already clean.');
      loadPayments();
    } catch (e) {
      setCleanupMsg(e.response?.data?.message || 'Could not run cleanup.');
    } finally {
      setCleaning(false);
    }
  }

  if (error) return <div className="disclaimer">{error}</div>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Payments</h1>
          <div className="muted">Subscription upgrades. "Demo" payments are simulated - no real money moved.</div>
        </div>
        <button className="btn btn-outline" disabled={cleaning} onClick={handleCleanup} title="Deletes payment history (and other records) left behind by users removed before cascading delete was in place">
          {cleaning ? 'Cleaning up…' : '🧹 Clean up orphaned data'}
        </button>
      </div>

      {cleanupMsg && <div className="card" style={{ margin: '14px 0', background: 'var(--sage-100)', border: 'none' }}>{cleanupMsg}</div>}

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Type</th><th>Item</th><th>Amount</th><th>Status</th><th>Mode</th><th>Date</th></tr></thead>
          <tbody>
            {payments.length === 0 && <tr><td colSpan={7} className="muted">No payments yet.</td></tr>}
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{p.user?.name || '—'}<div className="muted">{p.user?.phone}</div></td>
                <td>{p.type === 'subscription' ? 'Subscription' : 'Token Pack'}</td>
                <td>{p.refLabel}</td>
                <td>₹{p.amountINR}</td>
                <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                <td>{p.isDemo ? <span className="badge gold">Demo</span> : <span className="badge ok">Live</span>}</td>
                <td className="muted">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
