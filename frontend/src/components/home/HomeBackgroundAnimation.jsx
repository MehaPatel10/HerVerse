// Purely decorative, ambient background for the homepage: a slow-drawing
// heartbeat/pulse line plus a few softly drifting health icons. It's
// `position: fixed` + negative z-index + `pointer-events: none`, and this
// component is only ever imported by Home.jsx, so it can never overlap,
// resize, or interfere with anything on any other page.
export default function HomeBackgroundAnimation() {
  const icons = [
    { icon: '💗', top: '12%', left: '8%', delay: '0s', duration: '9s' },
    { icon: '🌿', top: '68%', left: '5%', delay: '1.2s', duration: '11s' },
    { icon: '✨', top: '22%', left: '92%', delay: '0.6s', duration: '10s' },
    { icon: '🩺', top: '78%', left: '90%', delay: '2s', duration: '12s' },
    { icon: '🌸', top: '46%', left: '50%', delay: '1.6s', duration: '13s' },
    { icon: '💧', top: '85%', left: '35%', delay: '0.3s', duration: '9.5s' }
  ];

  return (
    <div className="home-bg-anim" aria-hidden="true">
      <svg className="home-bg-pulse" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path
          d="M0,100 L180,100 L220,40 L260,160 L300,20 L340,100 L520,100 L560,60 L600,140 L640,100 L1200,100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {icons.map((it, i) => (
        <span
          key={i}
          className="home-bg-icon"
          style={{ top: it.top, left: it.left, animationDelay: it.delay, animationDuration: it.duration }}
        >
          {it.icon}
        </span>
      ))}
    </div>
  );
}
