import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient.js';

export default function PublicLunaDemo() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi, I'm LUNA 🌙 Ask me anything about your health - you get 3 free questions here." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(3);
  const [locked, setLocked] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || locked) return;

    const history = messages.map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/luna/public-chat', { message: text, history });
      setMessages((prev) => [...prev, { role: 'bot', content: data.reply }]);
      setRemaining(data.remaining);
      if (data.remaining <= 0) setLocked(true);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.limitReached) {
        setLocked(true);
      } else {
        setMessages((prev) => [...prev, { role: 'bot', content: "Sorry, I couldn't connect just now. Please try again." }]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') sendMessage();
  }

  return (
    <section className="section" id="luna">
      <div className="section-head">
        <div className="eyebrow">Try It Free</div>
        <h2 className="section-title">Meet LUNA, Your AI Health Assistant</h2>
        <p className="section-sub">Ask a health question and get a warm, easy-to-understand answer — 3 free questions, no login.</p>
      </div>

      <div className="pub-luna">
        <div className="card" style={{ padding: 0 }}>
          <div className="chat" ref={chatRef}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="msg bot">Typing…</div>}
          </div>

          {locked ? (
            <div className="luna-locked">
              <h3 style={{ marginBottom: 8 }}>You've used your 3 free Luna questions.</h3>
              <p className="muted" style={{ marginBottom: 18 }}>Create your HERVERSE account to continue your personalized health conversation.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link to="/auth?mode=signup" className="btn btn-primary">Create Free Account</Link>
                <Link to="/auth" className="btn btn-outline">Login</Link>
              </div>
            </div>
          ) : (
            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask LUNA a health question..."
              />
              <button className="btn btn-primary" style={{ borderRadius: '50%', width: 44, height: 44, padding: 0 }} onClick={sendMessage}>➤</button>
            </div>
          )}
        </div>

        {!locked && <div className="muted" style={{ textAlign: 'center', marginTop: 10 }}>{remaining} free question{remaining === 1 ? '' : 's'} remaining</div>}

        <div className="disclaimer" style={{ marginTop: 18 }}>
          Luna provides general health information and guidance. It is not a substitute for professional medical advice.
        </div>
      </div>
    </section>
  );
}
