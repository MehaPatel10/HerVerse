import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../common/Logo.jsx';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
    { to: '/admin/groq', label: 'Groq API Usage', icon: '🔑' },
    { to: '/admin/pricing', label: 'Pricing', icon: '💰' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
    { to: '/admin/blogs', label: 'Blogs', icon: '📝' },
    { to: '/admin/faqs', label: 'FAQs', icon: '❓' },
    { to: '/admin/payments', label: 'Payments', icon: '🧾' },
    { to: '/admin/reports', label: 'Report Activity', icon: '📄' },
    { to: '/admin/maintenance', label: 'Maintenance', icon: '🛠️' }
  ];

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div>
      <div className="admin">
        <aside className="admin-side">
          <Logo to={null} light showWordmark={false} />
          <div className="serif" style={{ color: '#fff', fontSize: 16, marginTop: 8 }}>herverse admin</div>
          <div className="muted" style={{ color: '#C99FB0', fontSize: 12, marginTop: 4 }}>{user?.name}</div>
          <nav className="side-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span>{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={handleLogout} style={{ color: '#E2C4D1', padding: '11px 13px', display: 'flex', gap: 12 }}>
            ↪ Log out
          </button>
        </aside>

        <main className="admin-main">
          <Outlet />
          <div className="admin-footer">
            © {new Date().getFullYear()} HERVERSE Admin. Internal panel — not part of the public client site.
          </div>
        </main>
      </div>
    </div>
  );
}
