import { useEffect, useState } from 'react';
import api from '../../api/axiosClient.js';

const FAQS = [
  { q: 'Do I need to create an account to use HERVERSE?', a: 'No. You can explore health articles, calculators, the health calendar, FAQs and try LUNA (3 free questions) without logging in. An account is only needed for personal period/health tracking and unlimited Luna access.' },
  { q: 'How does period tracking work?', a: 'Once you sign up, you log your cycle dates and symptoms and HERVERSE predicts your next period and fertile window based on your own history.' },
  { q: 'What is LUNA and how do the AI tokens work?', a: 'LUNA is your AI wellness assistant. Anonymous visitors get 3 free questions. After signing up, every plan includes a monthly token allowance: Free gets 3 tokens, Gold gets 50 tokens/month, and Platinum has unlimited access. You can also buy extra token packs any time.' },
  { q: 'Are the calculators accurate?', a: 'They give general estimates (BMI, water intake, calories) using standard formulas. They are not a diagnosis and don\'t account for every individual health factor.' },
  { q: 'Is my health data private?', a: 'Your personal tracking data is tied to your account and only visible to you. We ask for consent at signup and handle your data with privacy and security in mind.' },
  { q: 'When should I see a real doctor instead of asking Luna?', a: 'Any time symptoms are severe, sudden, or worsening — heavy bleeding, chest pain, difficulty breathing, fainting, severe pain — contact a healthcare professional or emergency services right away rather than relying on AI guidance.' },
  { q: 'Does HERVERSE diagnose medical conditions?', a: 'No. HERVERSE provides educational information, tracking tools and AI-powered general guidance. It does not diagnose conditions or replace a licensed healthcare professional.' }
];

function Item({ item, open, onToggle }) {
  return (
    <div className="accordion-item">
      <button className="accordion-q" onClick={onToggle}>
        <span>{item.q}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <p className="accordion-a" style={{ whiteSpace: 'pre-line' }}>{item.a}</p>}
    </div>
  );
}

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const [extra, setExtra] = useState([]);

  useEffect(() => {
    api.get('/content/faqs').then(({ data }) => setExtra(data.map((f) => ({ q: f.question, a: f.answer })))).catch(() => {});
  }, []);

  const allFaqs = [...FAQS, ...extra];

  return (
    <section className="section" id="faq">
      <div className="section-head">
        <div className="eyebrow">Good to know</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
      </div>

      <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
        {allFaqs.map((item, i) => (
          <Item key={`${i}-${item.q}`} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>

      <div className="disclaimer" style={{ maxWidth: 760, margin: '24px auto 0' }}>
        <b>Medical awareness:</b> HERVERSE provides educational information, health tracking and AI-powered general guidance.
        It does not diagnose medical conditions and does not replace professional medical advice. For urgent symptoms, please contact a doctor or emergency services.
      </div>
    </section>
  );
}
