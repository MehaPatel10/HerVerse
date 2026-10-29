import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer-inner">
        <div>
          <div style={{ marginBottom: 10 }}><Logo to="/" /></div>
          <p className="muted" style={{ maxWidth: 260 }}>AI-powered women's health tracking &amp; guidance, in one calm space.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/articles">Blogs</Link>
          <Link to="/calculators">Calculators</Link>
          <Link to="/luna">Luna</Link>
          <Link to="/awareness">Health Calendar</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/faq">FAQs</Link>
          <Link to="/stories">Feedback &amp; Stories</Link>
        </div>
        <div>
          <h4>Legal</h4>
          <Link to="/legal#privacy">Privacy Policy</Link>
          <Link to="/legal#terms">Terms &amp; Conditions</Link>
          <Link to="/legal#disclaimer">Medical Disclaimer</Link>
        </div>
      </div>
      <div className="pub-footer-bottom">
        © {new Date().getFullYear()} HERVERSE. General health information only — not a substitute for professional medical advice.
      </div>
    </footer>
  );
}
