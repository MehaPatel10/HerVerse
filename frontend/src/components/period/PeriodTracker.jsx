import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import { useHealthData } from '../layout/DashboardLayout.jsx';

const SYMPTOMS = ['Cramps', 'Mood swings', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Backache', 'Nausea', 'Dizziness', 'Insomnia'];

function fmt(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PeriodTracker() {
  const { periodPrediction, refreshPeriod } = useHealthData();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Cramps']);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  // AI temporary-remedy result, shown inline below the symptom chips
  // (not a popup) for whichever symptom was tapped most recently.
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [remedy, setRemedy] = useState(null);
  const [remedyLoading, setRemedyLoading] = useState(false);

  async function loadLogs() {
    const { data } = await api.get('/period');
    setLogs(data.logs);
  }

  useState(() => { loadLogs(); }, []);

  function toggleSymptom(s) {
    setSelectedSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSave() {
    if (!startDate) { setError('Pick a period start date to continue.'); return; }
    setError('');
    await api.post('/period', { startDate, endDate: endDate || undefined, cycleLength, symptoms: selectedSymptoms });
    setStartDate(''); setEndDate('');
    setShowForm(false);
    await refreshPeriod();
    await loadLogs();
  }

  // Tapping a symptom chip both toggles it for logging AND asks the AI
  // symptom checker for a quick temporary remedy / severity read, shown
  // inline just below the chips.
  async function handleSymptomTap(s) {
    toggleSymptom(s);
    setActiveSymptom(s);
    setRemedy(null);
    setRemedyLoading(true);
    try {
      const { data } = await api.post('/doctors/check-symptoms', { text: s });
      setRemedy(data);
    } catch (err) {
      setRemedy({
        causes: 'Could not reach the AI checker right now.',
        relief: 'Please try again in a moment, or rest and stay hydrated in the meantime.',
        severity: 'mild',
        care: []
      });
    } finally {
      setRemedyLoading(false);
    }
  }

  return (
    <div>
      <div className="two-col">
        <div className="card">
          <h3>Cycle prediction</h3>
          {periodPrediction ? (
            <>
              <p className="muted">Based on your last {periodPrediction.basedOnCycles} logged cycle(s)</p>
              <div className="grid2" style={{ marginTop: 16 }}>
                <div><div className="muted">Next period</div><div className="val" style={{ fontSize: 18 }}>{fmt(periodPrediction.nextPeriod)}</div></div>
                <div><div className="muted">Fertile window</div><div className="val" style={{ fontSize: 18 }}>{fmt(periodPrediction.fertileStart)} – {fmt(periodPrediction.fertileEnd)}</div></div>
                <div><div className="muted">Ovulation day</div><div className="val" style={{ fontSize: 18 }}>{fmt(periodPrediction.ovulation)}</div></div>
                <div><div className="muted">Cycle length</div><div className="val" style={{ fontSize: 18 }}>{periodPrediction.avgCycleLength} days avg</div></div>
              </div>
            </>
          ) : (
            <p className="muted">Log your first period date to see predictions.</p>
          )}

          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add period dates'}
          </button>

          {showForm && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div className="grid2">
                <div className="field"><label>Period start date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="field"><label>Period end date (optional)</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              </div>
              <div className="field"><label>Average cycle length (days)</label><input type="number" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} min="18" max="45" /></div>
              {error && <div className="error-text">{error}</div>}
              <button className="btn btn-primary" onClick={handleSave}>Save & predict</button>
            </div>
          )}

          {logs.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', color: 'var(--rose-600)', marginBottom: 10 }}>Logged periods</div>
              {logs.map((l) => (
                <div key={l._id} className="list-row">
                  <span>{fmt(l.startDate)} – {fmt(l.endDate)}</span>
                  <span className="muted">{l.cycleLength}-day cycle</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Log symptoms</h3>
          <p className="muted" style={{ marginBottom: 12 }}>Tap what you're feeling today for a quick AI-powered temporary remedy.</p>
          <div className="chips">
            {SYMPTOMS.map((s) => (
              <div key={s} className={`chip ${selectedSymptoms.includes(s) ? 'sel' : ''}`} onClick={() => handleSymptomTap(s)}>{s}</div>
            ))}
          </div>

          {activeSymptom && (
            <div className="remedy-inline">
              <div className="remedy-inline-head">
                <span>AI remedy for "{activeSymptom}"</span>
                <button className="del-btn" onClick={() => setActiveSymptom(null)}>✕</button>
              </div>

              {remedyLoading ? (
                <p className="muted">Checking with LUNA's AI symptom library…</p>
              ) : remedy ? (
                <>
                  <p className="muted" style={{ margin: '10px 0 8px' }}><b style={{ color: 'var(--rose-900)' }}>What it might be:</b> {remedy.causes}</p>
                  <p className="muted" style={{ marginBottom: 12 }}><b style={{ color: 'var(--rose-900)' }}>Temporary remedy:</b> {remedy.relief}</p>
                  <span className={`severity ${remedy.severity}`}>
                    ● {remedy.severity === 'mild' ? 'Mild — okay to manage at home' : remedy.severity === 'moderate' ? 'Moderate — consider seeing a doctor soon' : 'Severe — please see a doctor promptly'}
                  </span>

                  {remedy.severity !== 'mild' && remedy.care?.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rose-700)', marginBottom: 8 }}>Recommended doctors near you</div>
                      {remedy.care.slice(0, 2).map((c) => (
                        <div key={c.name} className="list-row">
                          <span>{c.icon} {c.name}</span>
                          <span className="muted">{c.area || c.distance}</span>
                        </div>
                      ))}
                      <button className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/dashboard/doctors')}>
                        Open Doctors &amp; Hospitals →
                      </button>
                    </div>
                  )}

                  <div className="disclaimer" style={{ marginTop: 16, marginBottom: 0 }}>
                    <b>AI disclaimer:</b> This is general, AI-generated self-care guidance — not a medical diagnosis or prescription. If symptoms are severe, worsening, or worrying you, please see a doctor.
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
