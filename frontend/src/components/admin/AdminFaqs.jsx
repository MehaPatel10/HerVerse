import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

const EMPTY = { question: '', answer: '', isPublished: true };

export default function AdminFaqs() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  function load() {
    api.get('/admin/faqs').then(({ data }) => setItems(data)).catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editingId) await api.put(`/admin/faqs/${editingId}`, form);
    else await api.post('/admin/faqs', form);
    setForm(EMPTY);
    setEditingId(null);
    load();
  }

  function startEdit(f) {
    setEditingId(f._id);
    setForm({ question: f.question, answer: f.answer, isPublished: f.isPublished });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  async function togglePublish(f) {
    await api.put(`/admin/faqs/${f._id}`, { isPublished: !f.isPublished });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this FAQ?')) return;
    await api.delete(`/admin/faqs/${id}`);
    if (editingId === id) { setEditingId(null); setForm(EMPTY); }
    load();
  }

  if (error) return <div className="disclaimer">{error}</div>;

  return (
    <div>
      <div className="dash-top">
        <div>
          <h1 style={{ fontSize: 23 }}>FAQs</h1>
          <div className="muted">Published FAQs appear on the public FAQ section, after the built-in questions.</div>
        </div>
      </div>

      <div className="card admin-panel">
        <table className="admin-table">
          <thead><tr><th>Question</th><th>Answer</th><th>Published</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="muted">No FAQs yet.</td></tr>}
            {items.map((f) => (
              <tr key={f._id}>
                <td style={{ maxWidth: 260 }}>{f.question}</td>
                <td style={{ maxWidth: 360 }}>{f.answer.length > 120 ? `${f.answer.slice(0, 120)}…` : f.answer}</td>
                <td><div className={`toggle ${f.isPublished ? 'on' : ''}`} onClick={() => togglePublish(f)} style={{ cursor: 'pointer' }}><i /></div></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-outline" onClick={() => startEdit(f)} style={{ marginRight: 8 }}>Edit</button>
                  <button className="btn btn-outline" onClick={() => remove(f._id)} style={{ color: 'var(--red-600)', borderColor: 'var(--red-600)' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card admin-panel">
        <h2>{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
        <form onSubmit={submit}>
          <div className="field"><label>Question</label><input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
          <div className="field"><label>Answer</label><textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Publish on the website
          </label>
          <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add FAQ'}</button>
          {editingId && <button className="btn btn-outline" type="button" style={{ marginLeft: 10 }} onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
        </form>
      </div>
    </div>
  );
}
