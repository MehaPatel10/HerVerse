import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function PublicNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/articles', label: 'Blogs' },
    { to: '/calculators', label: 'Calculators' },
    { to: '/luna', label: 'Luna' },
    { to: '/awareness', label: 'Health Calendar' },
    { to: '/stories', label: 'Stories' },
    { to: '/faq', label: 'FAQs' }
  ];

  return (
    <header className="pub-nav">
      <div className="pub-nav-inner">
        <Logo to="/" />

        <nav className="pub-nav-links">
          {links.map((l) => (
            <Link key={l.label} to={l.to}>{l.label}</Link>
          ))}
        </nav>

        <div className="pub-nav-cta">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn btn-outline" style={{ padding: '10px 18px' }}>Login</Link>
              <Link to="/auth?mode=signup" className="btn btn-primary" style={{ padding: '10px 18px' }}>Get Started</Link>
            </>
          )}
          <button className="pub-mobile-toggle" onClick={() => setOpen((o) => !o)} style={{ fontSize: 20 }}>☰</button>
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} style={{ padding: '10px 0', fontSize: 14.5 }}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
