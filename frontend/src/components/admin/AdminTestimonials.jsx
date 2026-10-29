import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

function TestiRow({ t, onSave, onDelete }) {
  const [published, setPublished] = useState(t.isPublished);

  async function togglePublish() {
    const next = !published;
    setPublished(next);
    await onSave(t._id, { isPublished: next });
  }

  return (
    <tr>
      <td>{t.name}</td>
      <td style={{ maxWidth: 320 }}>{t.message}</td>
      <td>{'★'.repeat(t.rating)}</td>
      <td><div className={`toggle ${published ? 'on' : ''}`} onClick={togglePublish} style={{ cursor: 'pointer' }}><i /></div></td>
      <td><button className="btn btn-outline" onClick={() => onDelete(t._id)} style={{ color: 'var(--red-600)', borderColor: 'var(--red-600)' }}>Delete</button></td>
    </tr>
  );
}

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', message: '', rating: 5 });

  function load() {
    api.get('/admin/testimonials').then(({ data }) => setItems(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }
  useEffect(() => { load(); }, []);

  async function save(id, update) {
    await api.put(`/admin/testimonials/${id}`, update);
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this testimonial?')) return;
    await api.delete(`/admin/testimonials/${id}`);
    load();
  }

  async function create(e) {
    e.preventDefault();
    if (!form.name || !form.message) return;
    await api.post('/admin/testimonials', { ...form, isPublished: false, sortOrder: items.length + 1 });
    setForm({ name: '', message: '', rating: 5 });
    load();
  }

  if (error) return <div className="disclaimer">{error}</div>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Testimonials</h1>
          <div className="muted">Toggle "Published" to show a testimonial on the public homepage (only the 3 most recent published ones show).</div>
        </div>
      </div>

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Message</th><th>Rating</th><th>Published</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="muted">No testimonials yet.</td></tr>}
            {items.map((t) => <TestiRow key={t._id} t={t} onSave={save} onDelete={remove} />)}
          </tbody>
        </table>
      </div>

      <div className="card admin-panel">
        <h2>Add Testimonial</h2>
        <form onSubmit={create}>
          <div className="grid2">
            <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field">
              <label>Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Message</label><textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn btn-primary" type="submit">Add Testimonial</button>
        </form>
      </div>
    </div>
  );
}
