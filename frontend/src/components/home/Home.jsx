import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion from './FAQAccordion.jsx';
import HomeBackgroundAnimation from './HomeBackgroundAnimation.jsx';

const WHY_CARDS = [
  { icon: '🤖', title: 'AI-Powered Guidance', desc: 'Get simple, personalized health guidance powered by LUNA, our AI assistant.' },
  { icon: '🌸', title: "Women's Health Focused", desc: 'Built specifically around women\u2019s health, wellness, and everyday concerns.' },
  { icon: '📊', title: 'Track Your Health', desc: 'Keep your cycle, symptoms, sleep and nutrition organized in one place.' },
  { icon: '🧠', title: 'Understand Your Body', desc: 'Learn about cycles, symptoms, wellness, nutrition and common health topics.' },
  { icon: '✨', title: 'Personalized Insights', desc: 'Turn your health tracking data into meaningful, easy-to-read insights.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'Your personal health information is handled with privacy and security in mind.' }
];

const TIPS = {
  0: { day: 'Sunday', tip: 'Plan your meals and wellness goals for the week ahead.' },
  1: { day: 'Monday', tip: 'Drink enough water throughout the day to support your overall wellness.' },
  2: { day: 'Tuesday', tip: 'Take a 30-minute walk and give your body some movement.' },
  3: { day: 'Wednesday', tip: 'Aim for 7–8 hours of quality sleep tonight.' },
  4: { day: 'Thursday', tip: 'Add more fruits and vegetables to your daily meals.' },
  5: { day: 'Friday', tip: 'Take a few minutes today to slow down and reduce stress.' },
  6: { day: 'Saturday', tip: 'Listen to your body and give yourself time to rest.' }
};

function Section({ id, eyebrow, title, sub, children }) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const todayTip = TIPS[new Date().getDay()];

  return (
    <div>
      <HomeBackgroundAnimation />
      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '70px 24px 60px', textAlign: 'center' }}>
        <div className="eyebrow">HERVERSE — AI-Powered Women's Health Guidance &amp; Tracking</div>
        <h1 style={{ fontSize: 46, lineHeight: 1.12, margin: '14px 0 18px' }}>
          Your Health. Your Journey. <em style={{ color: 'var(--rose-600)', fontStyle: 'italic' }}>Your HERVERSE.</em> 🌙
        </h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: 560, margin: '0 auto 30px' }}>
          An AI-powered women's health companion designed to help you understand, track, and take better care of your health —
          cycle tracking, wellness guidance and health education, all in one calm space.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/auth?mode=signup" className="btn btn-primary">Start Your Journey</Link>
          <Link to="/luna" className="btn btn-outline">Talk to Luna</Link>
        </div>
      </div>

      {/* WHY CHOOSE */}
      <Section eyebrow="Why HERVERSE" title="Why Choose HERVERSE?">
        <div className="feature-grid">
          {WHY_CARDS.map((c) => (
            <div key={c.title} className="card feature-card">
              <div className="feature-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section eyebrow="Simple Process" title="How HERVERSE Works">
        <div className="steps-row">
          <div className="card step-card"><div className="step-num">01</div><h3 style={{ marginBottom: 6 }}>Track</h3><p className="muted">Track your health, cycles, symptoms, habits and wellness information.</p></div>
          <div className="card step-card"><div className="step-num">02</div><h3 style={{ marginBottom: 6 }}>Understand</h3><p className="muted">HERVERSE helps you understand patterns with easy-to-read insights.</p></div>
          <div className="card step-card"><div className="step-num">03</div><h3 style={{ marginBottom: 6 }}>Get Guidance</h3><p className="muted">Use LUNA's AI-powered guidance to make more informed wellness decisions.</p></div>
        </div>
      </Section>

      {/* HEALTH TIP OF THE DAY */}
      <Section title="Today's Health Tip">
        <div className="card tip-card">
          <div className="tip-label">💡 Health Tip · {todayTip.day}</div>
          <p style={{ fontSize: 17 }}>{todayTip.tip}</p>
        </div>
      </Section>

      {/* Quick links to the pages now only reachable from the header */}
      <Section eyebrow="Explore more" title="More from HERVERSE" sub="Blogs, calculators, Luna, your health calendar and community stories all live in the menu above.">
        <div className="feature-grid">
          <Link to="/articles" className="card feature-card" style={{ textDecoration: 'none' }}>
            <div className="feature-icon">📰</div>
            <h3>Blogs</h3>
            <p>Easy-to-understand health articles, cycle-by-cycle.</p>
          </Link>
          <Link to="/calculators" className="card feature-card" style={{ textDecoration: 'none' }}>
            <div className="feature-icon">🧮</div>
            <h3>Calculators</h3>
            <p>BMI, ovulation, due-date and more, in one place.</p>
          </Link>
          <Link to="/luna" className="card feature-card" style={{ textDecoration: 'none' }}>
            <div className="feature-icon">💬</div>
            <h3>Luna</h3>
            <p>Try a free preview of our AI wellness assistant.</p>
          </Link>
          <Link to="/awareness" className="card feature-card" style={{ textDecoration: 'none' }}>
            <div className="feature-icon">📅</div>
            <h3>Health Calendar</h3>
            <p>Awareness days and observances worth knowing about.</p>
          </Link>
          <Link to="/stories" className="card feature-card" style={{ textDecoration: 'none' }}>
            <div className="feature-icon">💗</div>
            <h3>Stories</h3>
            <p>Real journeys from the HERVERSE community.</p>
          </Link>
          <Link to="/faq" className="card feature-card" style={{ textDecoration: 'none' }}>
            <div className="feature-icon">❓</div>
            <h3>FAQs</h3>
            <p>Answers to the questions we hear most often.</p>
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <FAQAccordion />

      {/* FINAL CTA */}
      <div style={{ padding: '20px 0 80px' }}>
        <div className="final-cta-wrap">
          <div className="final-cta">
            <h2>Your Health Journey Starts Here.</h2>
            <p>Understand your body. Track your wellness. Get guidance with HERVERSE.</p>
            <div className="cta-row" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth?mode=signup" className="btn btn-primary">Start Your Free Journey</Link>
              <Link to="/luna" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>Talk to Luna</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
