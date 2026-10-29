import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

function PlanRow({ plan, onSave }) {
  const [price, setPrice] = useState(plan.priceINR);
  const [tokens, setTokens] = useState(plan.monthlyTokens);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave(plan.tier, { priceINR: Number(price), monthlyTokens: Number(tokens) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td><span className={`badge ${plan.tier}`}>{plan.label}</span></td>
      <td>
        <div className="inline-edit">
          ₹<input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /> / mo
        </div>
      </td>
      <td>
        <div className="inline-edit">
          <input type="number" value={tokens} onChange={(e) => setTokens(e.target.value)} placeholder="-1 = unlimited" />
        </div>
      </td>
      <td><button className="btn btn-outline" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button></td>
    </tr>
  );
}

export default function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  function load() {
    api.get('/admin/pricing').then(({ data }) => setPlans(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }
  useEffect(() => { load(); }, []);

  async function save(tier, update) {
    await api.put(`/admin/pricing/${tier}`, update);
    setMsg(`${tier} plan updated.`);
    setTimeout(() => setMsg(''), 2500);
    load();
  }

  if (error) return <div className="disclaimer">{error}</div>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Subscription Pricing</h1>
          <div className="muted">Prices shown to users on the Subscription page, in ₹ per month. Changes apply immediately.</div>
        </div>
      </div>

      {msg && <div className="card" style={{ background: 'var(--sage-100)', border: 'none', marginBottom: 16 }}>{msg}</div>}

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>Tier</th><th>Price / month</th><th>Monthly Tokens (-1 = unlimited)</th><th></th></tr></thead>
          <tbody>
            {plans.map((p) => <PlanRow key={p.tier} plan={p} onSave={save} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
