import { useState, useEffect } from 'react';
import api from '../../api/axiosClient.js';

export default function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  async function loadContacts() {
    const { data } = await api.get('/emergency/contacts');
    setContacts(data);
  }
  useEffect(() => { loadContacts(); }, []);

  async function handleSave() {
    if (!name || !phone) { setError('Add at least a name and phone number.'); return; }
    setError('');
    await api.post('/emergency/contacts', { name, relation, phone });
    setName(''); setRelation(''); setPhone(''); setShowForm(false);
    await loadContacts();
  }

  async function handleDelete(id) {
    await api.delete(`/emergency/contacts/${id}`);
    await loadContacts();
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(160deg, var(--red-600), #8E2E2A)', borderRadius: 18, padding: 30, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: 20 }}>Need help right now?</h3>
          <p style={{ opacity: 0.9, fontSize: 13, marginTop: 6 }}>Sharing live location with your emergency contacts.</p>
        </div>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#fff', color: 'var(--red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>SOS</div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Emergency contacts</h3>
          <div style={{ marginTop: 12 }}>
            {contacts.length === 0 && <p className="muted">No emergency contacts added yet.</p>}
            {contacts.map((c) => (
              <div key={c._id} className="list-row">
                <div>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div className="muted">{c.relation ? `${c.relation} · ` : ''}{c.phone}</div>
                </div>
                <button className="del-btn" onClick={() => handleDelete(c._id)}>✕</button>
              </div>
            ))}
          </div>

          <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => setShowForm(!showForm)}>+ Add contact</button>
          {showForm && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div className="grid2">
                <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riya Sharma" /></div>
                <div className="field"><label>Relationship</label><input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g. Sister" /></div>
              </div>
              <div className="field"><label>Phone number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
              {error && <div className="error-text">{error}</div>}
              <button className="btn btn-primary" onClick={handleSave}>Save contact</button>
            </div>
          )}
        </div>

        <div className="card">
          <h3>National emergency numbers</h3>
          <div className="list-row"><span>National emergency</span><span style={{ fontWeight: 600, color: 'var(--rose-700)' }}>112</span></div>
          <div className="list-row"><span>Ambulance</span><span style={{ fontWeight: 600, color: 'var(--rose-700)' }}>108</span></div>
          <div className="list-row"><span>Women's helpline</span><span style={{ fontWeight: 600, color: 'var(--rose-700)' }}>1091</span></div>
          <div className="disclaimer" style={{ marginTop: 18 }}>
            <b>First-aid guide gives temporary solutions only</b> — for anything serious, call emergency services immediately.
          </div>
        </div>
      </div>
    </div>
  );
}
