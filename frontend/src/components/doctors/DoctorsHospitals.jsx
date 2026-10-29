import { useState } from 'react';
import api from '../../api/axiosClient.js';

export default function DoctorsHospitals() {
  const [text, setText] = useState('');
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!text.trim()) { setError('Describe your symptoms to run the check.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/doctors/check-symptoms', { text, pincode: pincode.trim() || undefined });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3>AI symptom checker</h3>
        <p className="muted" style={{ margin: '10px 0 16px' }}>Describe any symptom — physical, emotional, or anything in between, from period cramps to a cut or a stressful week — for AI analysis, possible causes, temporary relief, and a severity level. Add your PIN code to get real nearby hospitals and doctors — currently supported for the Ahmedabad area only.</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <input
            style={{ flex: 2, minWidth: 220, padding: '12px 14px', borderRadius: 10, border: '1.3px solid var(--border)' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. my finger got cut and it's bleeding heavily"
          />
          <input
            style={{ flex: 1, minWidth: 160, padding: '12px 14px', borderRadius: 10, border: '1.3px solid var(--border)' }}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Your PIN code"
            inputMode="numeric"
          />
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
        </div>
        {error && <div className="error-text">{error}</div>}

        {result && (
          <div style={{ marginTop: 14, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {result.locationNote && (
              <div className="disclaimer" style={{ marginBottom: 14, background: 'var(--gold-100)', color: '#7A5A1E', borderColor: 'transparent' }}>
                📍 {result.locationNote}
              </div>
            )}
            <p className="muted" style={{ marginBottom: 8 }}><b style={{ color: 'var(--rose-900)' }}>Possible causes:</b> {result.causes}</p>
            <p className="muted" style={{ marginBottom: 12 }}><b style={{ color: 'var(--rose-900)' }}>Temporary relief:</b> {result.relief}</p>
            <span className={`severity ${result.severity}`}>
              ● {result.severity === 'mild' ? 'Mild — monitor at home' : result.severity === 'moderate' ? 'Moderate — consider seeing a doctor soon' : 'Severe — please seek care promptly'}
            </span>
            <div className="disclaimer" style={{ marginTop: 16 }}>
              <b>This is general guidance, not a diagnosis.</b> If symptoms are severe, worsening, or worrying you, please see a doctor.
            </div>
          </div>
        )}
      </div>

      {result && (
        <>
          <h3 style={{ marginBottom: 14 }}>
            {result.areaName
              ? `Nearby PIN ${pincode} (${result.areaName}), matched to ${result.specialists.join(' / ')}`
              : pincode
              ? `Nearby PIN ${pincode}, matched to ${result.specialists.join(' / ')}`
              : `Matched to ${result.specialists.join(' / ')}`}
          </h3>
          {result.care.length === 0 && (
            <p className="muted" style={{ marginBottom: 14 }}>No results to show for this PIN code yet.</p>
          )}
          <div className="two-col">
            {result.care.map((c, i) => (
              <div key={`${c.name}-${i}`} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ fontSize: 24 }}>{c.icon || (c.type === 'hospital' ? '🏥' : '👩‍⚕️')}</div>
                <div>
                  <h4 style={{ fontSize: 14.5 }}>{c.name} — {c.role}</h4>
                  {c.doctorName && c.doctorName !== c.name && <p className="muted" style={{ marginTop: 2 }}>{c.doctorName}</p>}
                  <p className="muted">
                    {c.area || ''}{c.pincode ? ` · PIN ${c.pincode}` : ''}{(c.distanceKm != null || c.distance) ? ` · ${c.distanceKm != null ? c.distanceKm + ' km' : c.distance} away` : ''}
                  </p>
                  {c.rating && <div style={{ fontSize: 12.5, color: 'var(--gold-600)', marginTop: 3 }}>★ {c.rating}{c.reviews ? ` (${c.reviews} reviews)` : ''}</div>}
                  {c.phone && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>📞 {c.phone}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
