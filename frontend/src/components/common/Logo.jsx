import { Link } from 'react-router-dom';

/**
 * HERVERSE logo: a crescent moon cradling a small leaf/bloom, standing in
 * for "women's health + cycles + wellness". `light` renders the wordmark in
 * white (for the dark sidebars); otherwise it uses the rose ink color.
 */
export default function Logo({ to = '/', light = false, size = 20, showWordmark = true, className = '' }) {
  const content = (
    <span className={`hv-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <svg width={size + 12} height={size + 12} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flex: 'none' }}>
        <circle cx="20" cy="20" r="19" fill={light ? 'rgba(255,255,255,0.12)' : 'var(--rose-100)'} />
        <path
          d="M25.5 10.5C21 12 18.2 16.1 18.2 20.6c0 4.9 3.4 9 8 10.1-1.4.6-2.9.9-4.5.9-6.6 0-12-5.4-12-12s5.4-12 12-12c1.4 0 2.8.2 4 .7-.08.03-.15.08-.2.2z"
          fill={light ? '#fff' : 'var(--rose-600)'}
        />
        <path
          d="M22 17c2.6 0 4.7 2.1 4.7 4.8 0 2.9-2.4 5.6-4.7 7.4-2.3-1.8-4.7-4.5-4.7-7.4 0-2.7 2.1-4.8 4.7-4.8z"
          fill={light ? '#F4C9DA' : 'var(--gold-600)'}
          opacity="0.9"
        />
      </svg>
      {showWordmark && (
        <span className="serif" style={{ fontSize: size, color: light ? '#fff' : 'var(--rose-900)', lineHeight: 1 }}>
          herverse
        </span>
      )}
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} style={{ textDecoration: 'none' }} aria-label="HERVERSE home">
      {content}
    </Link>
  );
}
