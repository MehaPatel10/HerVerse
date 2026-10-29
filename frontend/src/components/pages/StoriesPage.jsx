import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

export default function StoriesPage() {
  const [testimonials, setTestimonials] = useState(null);

  useEffect(() => {
    api.get('/testimonials').then(({ data }) => setTestimonials(data)).catch(() => setTestimonials([]));
  }, []);

  return (
    <section className="section">
      <div className="section-head">
        <div className="eyebrow">Community</div>
        <h1 className="section-title">Real Stories. Real Journeys.</h1>
        <p className="section-sub">What HERVERSE members have shared about their experience.</p>
      </div>

      {testimonials === null && <p className="muted" style={{ textAlign: 'center' }}>Loading stories…</p>}
      {testimonials?.length === 0 && <p className="muted" style={{ textAlign: 'center' }}>No stories published yet — check back soon.</p>}

      <div className="testi-grid">
        {testimonials?.map((t) => (
          <div key={t._id} className="card testi-card">
            <div className="testi-stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
            <p style={{ fontSize: 14.5, marginBottom: 14 }}>"{t.message}"</p>
            <div className="muted">— {t.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
