import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LegalContent from '../common/LegalContent.jsx';

export default function LegalPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <section className="section" style={{ maxWidth: 820 }}>
      <div className="section-head" style={{ maxWidth: 700 }}>
        <div className="eyebrow">Legal</div>
        <h1 className="section-title">Privacy, Terms &amp; Medical Disclaimer</h1>
        <p className="section-sub">Everything you should know about how HERVERSE handles your data and guidance.</p>
      </div>
      <LegalContent />
    </section>
  );
}
