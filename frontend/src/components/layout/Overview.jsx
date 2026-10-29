import { Link } from 'react-router-dom';
import { useHealthData } from './DashboardLayout.jsx';

const features = [
  { to: '/dashboard/period', icon: '🌙', title: 'Period tracker', desc: 'Cycle predictions, fertile window & symptoms.' },
  { to: '/dashboard/luna', icon: '💬', title: 'Ask LUNA', desc: 'Your AI wellness assistant, powered by Groq.' },
  { to: '/dashboard/diet', icon: '🥗', title: 'Diet planner', desc: 'AI meal plans, recipes & nutrition tracking.' },
  { to: '/dashboard/health', icon: '📈', title: 'Health tracker', desc: 'Sleep, steps, water & weight in one place.' },
  { to: '/dashboard/doctors', icon: '🩺', title: 'Doctors & hospitals', desc: 'Symptom checker plus nearby care, rated.' },
  { to: '/dashboard/emergency', icon: '🚑', title: 'Emergency', desc: 'SOS, emergency contacts, national numbers.' },
  { to: '/dashboard/reports', icon: '🧾', title: 'Reports', desc: 'Day-wise PDF health report — download or email.' }
];

export default function Overview() {
  const { periodPrediction } = useHealthData();

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Cycle overview</h3>
        {periodPrediction ? (
          <p className="muted" style={{ marginTop: 6 }}>
            Next period around {new Date(periodPrediction.nextPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·
            {' '}Fertile window {new Date(periodPrediction.fertileStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {new Date(periodPrediction.fertileEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        ) : (
          <p className="muted" style={{ marginTop: 6 }}>Log your first period date to see predictions here.</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {features.map((f) => (
          <Link to={f.to} key={f.to} className="card" style={{ display: 'block' }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>{f.icon}</div>
            <h3 style={{ fontSize: 15 }}>{f.title}</h3>
            <p className="muted" style={{ marginTop: 4 }}>{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
