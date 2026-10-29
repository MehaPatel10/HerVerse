import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

function UserRow({ u, onSave, onRemove }) {
  const [tier, setTier] = useState(u.tier);
  const [tokenBalance, setTokenBalance] = useState(u.tokenBalance);
  const [role, setRole] = useState(u.role);
  const [saving, setSaving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave(u._id, { tier, tokenBalance: Number(tokenBalance), role });
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemove() {
    setRemoving(true);
    try {
      await onRemove(u._id);
    } finally {
      setRemoving(false);
      setConfirmingRemove(false);
    }
  }

  return (
    <tr>
      <td>{u.name}</td>
      <td className="muted">{u.phone}</td>
      <td>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="free">Free</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
        </select>
      </td>
      <td><input type="number" value={tokenBalance} onChange={(e) => setTokenBalance(e.target.value)} style={{ width: 70 }} /></td>
      <td>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
      <td style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-outline" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        {confirmingRemove ? (
          <>
            <button className="btn btn-outline" style={{ borderColor: 'var(--red-600)', color: 'var(--red-600)' }} disabled={removing} onClick={confirmRemove}>
              {removing ? 'Removing…' : 'Confirm'}
            </button>
            <button className="btn btn-outline" onClick={() => setConfirmingRemove(false)}>Cancel</button>
          </>
        ) : (
          <button className="btn btn-outline" style={{ borderColor: 'var(--red-600)', color: 'var(--red-600)' }} onClick={() => setConfirmingRemove(true)} title="Also permanently deletes this user's payment history, health/food/period logs, reminders and emergency contacts">
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  function load(q = '') {
    api.get('/admin/users', { params: { search: q } }).then(({ data }) => setUsers(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }
  useEffect(() => { load(); }, []);

  async function save(id, update) {
    await api.put(`/admin/users/${id}`, update);
    load(search);
  }

  async function remove(id) {
    try {
      await api.delete(`/admin/users/${id}`);
      setMsg('User removed.');
      setTimeout(() => setMsg(''), 2500);
      load(search);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not remove this user.');
      setTimeout(() => setMsg(''), 3500);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    load(search);
  }

  if (error) return <div className="disclaimer">{error}</div>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Users</h1>
          <div className="muted">{users.length} shown · manually adjust a user's tier, tokens, admin role, or remove their account</div>
        </div>
      </div>

      {msg && <div className="card" style={{ background: 'var(--sage-100, #E4F0E6)', border: 'none', marginBottom: 16 }}>{msg}</div>}

      <form onSubmit={handleSearch} style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone" style={{ maxWidth: 280 }} />
        <button className="btn btn-outline" type="submit">Search</button>
      </form>

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Tier</th><th>Tokens</th><th>Role</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={7} className="muted">No users found.</td></tr>}
            {users.map((u) => <UserRow key={u._id} u={u} onSave={save} onRemove={remove} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
