import { useMemo, useState } from 'react';

// month is 1-12
const EVENTS = [
  { month: 2, day: 4, name: 'World Cancer Day', category: 'Awareness', desc: 'Raises awareness for cancer prevention, detection and treatment worldwide.' },
  { month: 3, day: 8, name: "International Women's Day", category: "Women's Health", desc: "A day honoring women's achievements and calling attention to women's health and rights." },
  { month: 4, day: 7, name: 'World Health Day', category: 'Awareness', desc: 'A WHO global health awareness day focused on a different health theme each year.' },
  { month: 5, day: 28, name: 'World Menstrual Hygiene Day', category: "Women's Health", desc: 'Promotes good menstrual hygiene management and breaks period stigma.' },
  { month: 9, day: 1, name: "World PCOS Day", category: "Women's Health", desc: 'Raises awareness about Polycystic Ovary Syndrome, its symptoms and management.' },
  { month: 10, day: 1, name: "Breast Cancer Awareness Month", category: "Women's Health", desc: 'A month dedicated to breast cancer education, early detection and support.' },
  { month: 10, day: 10, name: 'World Mental Health Day', category: 'Mental Wellness', desc: 'Focuses on mental health education, awareness and reducing stigma.' },
  { month: 11, day: 14, name: 'World Diabetes Day', category: 'Awareness', desc: 'Raises awareness of diabetes as a growing global health issue.' },
  { month: 5, day: 28, name: "International Day of Action for Women's Health", category: "Women's Health", desc: "Highlights access to reproductive and sexual health services for women." },
  { month: 9, day: 9, name: "Women's Health Week (starts)", category: "Women's Health", desc: 'A week focused on encouraging women to prioritize regular checkups and wellness habits.' }
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AwarenessCalendar() {
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth()); // 0-based

  const eventsThisMonth = useMemo(
    () => EVENTS.filter((e) => e.month === monthIndex + 1).sort((a, b) => a.day - b.day),
    [monthIndex]
  );

  function shift(delta) {
    setMonthIndex((m) => (m + delta + 12) % 12);
  }

  return (
    <section className="section" id="awareness">
      <div className="section-head">
        <div className="eyebrow">Health Calendar</div>
        <h2 className="section-title">Women's Health &amp; Awareness Calendar</h2>
        <p className="section-sub">Important health awareness dates, month by month.</p>
      </div>

      <div className="card cal-wrap">
        <div className="cal-nav">
          <button className="btn btn-outline" onClick={() => shift(-1)}>← Prev</button>
          <h3 className="serif" style={{ fontSize: 20 }}>{MONTH_NAMES[monthIndex]}</h3>
          <button className="btn btn-outline" onClick={() => shift(1)}>Next →</button>
        </div>

        <div className="cal-events">
          {eventsThisMonth.length === 0 && <p className="muted">No listed awareness events this month.</p>}
          {eventsThisMonth.map((e) => (
            <div key={e.name} className="cal-event">
              <div className="cal-date-chip"><div className="d">{e.day}</div><div className="m">{MONTH_NAMES[monthIndex].slice(0, 3)}</div></div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14.5 }}>{e.name} <span className="muted" style={{ marginLeft: 6 }}>· {e.category}</span></div>
                <div className="muted" style={{ marginTop: 3 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
