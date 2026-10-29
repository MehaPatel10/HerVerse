import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

const ARTICLES = [
  { title: 'Understanding Your Menstrual Cycle', tag: 'Cycle Health', blurb: 'A simple breakdown of the four phases of your cycle — menstrual, follicular, ovulation and luteal — and what counts as normal for each.' },
  { title: 'Understanding PCOS', tag: "Women's Health", blurb: 'Common symptoms of Polycystic Ovary Syndrome, what causes it, and everyday lifestyle habits that help manage it.' },
  { title: "Nutrition for Women's Wellness", tag: 'Nutrition', blurb: 'Everyday food choices that support hormonal balance, iron levels, and steady energy through the month.' },
  { title: 'Common Period Problems', tag: 'Cycle Health', blurb: 'Cramps, irregular cycles, heavy flow and mood changes — what\u2019s typical, and when it\u2019s worth mentioning to a doctor.' },
  { title: 'Stress & Women\u2019s Health', tag: 'Mental Wellness', blurb: 'How chronic stress can affect your cycle, sleep and appetite, and simple habits that help regulate it.' },
  { title: 'Sleep & Hormonal Health', tag: 'Wellness', blurb: 'Why sleep quality shifts across your cycle, and small changes that can improve rest during PMS or perimenopause.' },
  { title: "Women's Mental Wellness", tag: 'Mental Wellness', blurb: 'Recognizing anxiety, low mood, and burnout early, and simple, sustainable ways to support your mental health.' },
  { title: 'Preventive Health Awareness', tag: 'Awareness', blurb: 'Screenings and checkups worth knowing about at every life stage, from your 20s through menopause.' }
];

export default function ArticlesPage() {
  const [blogs, setBlogs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.get('/content/blogs').then(({ data }) => setBlogs(data)).catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="section-head">
        <div className="eyebrow">Learn</div>
        <h1 className="section-title">Health Knowledge, Made Simple</h1>
        <p className="section-sub">Easy-to-understand articles on cycle health, nutrition, and wellness — no login needed.</p>
      </div>
      <div className="feature-grid">
        {ARTICLES.map((a) => (
          <div key={a.title} className="card feature-card">
            <div className="eyebrow" style={{ marginBottom: 8 }}>{a.tag}</div>
            <h3>{a.title}</h3>
            <p>{a.blurb}</p>
          </div>
        ))}
        {blogs.map((b) => (
          <div key={b._id} className="card feature-card">
            <div className="eyebrow" style={{ marginBottom: 8 }}>{b.tag}</div>
            <h3>{b.title}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{openId === b._id ? b.content : (b.blurb || `${b.content.slice(0, 160)}${b.content.length > 160 ? '…' : ''}`)}</p>
            {(b.content.length > 160 || b.blurb) && (
              <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => setOpenId(openId === b._id ? null : b._id)}>
                {openId === b._id ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
