import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

const EMPTY = { title: '', tag: 'Wellness', blurb: '', content: '', isPublished: true };

export default function AdminBlogs() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  function load() {
    api.get('/admin/blogs').then(({ data }) => setItems(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (editingId) await api.put(`/admin/blogs/${editingId}`, form);
    else await api.post('/admin/blogs', form);
    setForm(EMPTY);
    setEditingId(null);
    load();
  }

  function startEdit(b) {
    setEditingId(b._id);
    setForm({ title: b.title, tag: b.tag, blurb: b.blurb, content: b.content, isPublished: b.isPublished });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  async function togglePublish(b) {
    await api.put(`/admin/blogs/${b._id}`, { isPublished: !b.isPublished });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this blog?')) return;
    await api.delete(`/admin/blogs/${id}`);
    if (editingId === id) { setEditingId(null); setForm(EMPTY); }
    load();
  }

  if (error) return <div className="disclaimer">{error}</div>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>Blogs</h1>
          <div className="muted">Published blogs appear on the public Articles page, after the built-in articles.</div>
        </div>
      </div>

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Tag</th><th>Published</th><th>Added</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="muted">No blogs yet.</td></tr>}
            {items.map((b) => (
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.tag}</td>
                <td><div className={`toggle ${b.isPublished ? 'on' : ''}`} onClick={() => togglePublish(b)} style={{ cursor: 'pointer' }}><i /></div></td>
                <td>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-outline" onClick={() => startEdit(b)} style={{ marginRight: 8 }}>Edit</button>
                  <button className="btn btn-outline" onClick={() => remove(b._id)} style={{ color: 'var(--red-600)', borderColor: 'var(--red-600)' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card admin-panel">
        <h2>{editingId ? 'Edit Blog' : 'Add Blog'}</h2>
        <form onSubmit={submit}>
          <div className="grid2">
            <div className="field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="field"><label>Tag / category</label><input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Nutrition" /></div>
          </div>
          <div className="field"><label>Short summary (shown on the card)</label><textarea rows={2} value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} /></div>
          <div className="field"><label>Full article</label><textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Publish on the website
          </label>
          <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add Blog'}</button>
          {editingId && <button className="btn btn-outline" type="button" style={{ marginLeft: 10 }} onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
        </form>
      </div>
    </div>
  );
}
