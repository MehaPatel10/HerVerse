import { useState } from 'react';
import api from '../../api/axiosClient.js';

function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Reports() {
  const [date, setDate] = useState(todayKey());
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleDownload() {
    setError(''); setMessage('');
    setDownloading(true);
    try {
      const res = await api.get(`/reports/day/${date}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `HERVERSE-Report-${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleEmail() {
    setError(''); setMessage('');
    setEmailing(true);
    try {
      const { data } = await api.post(`/reports/day/${date}/email`);
      setMessage(data.message || 'Report emailed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not email the report.');
    } finally {
      setEmailing(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Day-wise health report</h3>
        <p className="muted" style={{ margin: '10px 0 18px' }}>
          Get a clean, printable PDF summary of your sleep, steps, water, weight, meals (with protein) and your next expected period for any day — download it or have it emailed to you.
        </p>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Report date</label>
            <input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Preparing PDF…' : '⬇ Download PDF'}
          </button>
          <button className="btn btn-outline" onClick={handleEmail} disabled={emailing}>
            {emailing ? 'Sending…' : '✉ Email me this report'}
          </button>
        </div>

        {message && <div style={{ fontSize: 13, color: 'var(--sage-700, #4B7A5A)', marginTop: 14 }}>✓ {message}</div>}
        {error && <div className="error-text" style={{ marginTop: 14 }}>{error}</div>}
      </div>
    </div>
  );
}
