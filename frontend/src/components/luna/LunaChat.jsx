import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axiosClient.js';

export default function LunaChat() {
  const { user, updateUser } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi, I'm LUNA 🌙 How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedCare, setSuggestedCare] = useState([]);
  const [outOfTokens, setOutOfTokens] = useState(false);
  // When LUNA needs a pincode to look up nearby care, we stash the
  // original symptom message here so we can resend it once the pincode arrives.
  const [awaitingPincode, setAwaitingPincode] = useState(null);
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');
  const chatRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, awaitingPincode]);

  async function sendToLuna(text, extraPayload = {}) {
    const history = messages.map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));
    setLoading(true);
    try {
      const { data } = await api.post('/luna/chat', { message: text, history, ...extraPayload });

      setMessages((prev) => [...prev, { role: 'bot', content: data.reply }]);
      setSuggestedCare(data.suggestedCare || []);

      if (data.needPincode) {
        setAwaitingPincode(text);
      } else {
        setAwaitingPincode(null);
      }

      updateUser({ tokenBalance: data.tokenBalance, tier: data.tier });
    } catch (err) {
      if (err.response?.status === 402) {
        setOutOfTokens(true);
        updateUser({ tokenBalance: err.response.data.tokenBalance, tier: err.response.data.tier });
      } else {
        setMessages((prev) => [...prev, { role: 'bot', content: "Sorry, I couldn't connect just now. Please try again." }]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || loading || outOfTokens) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    await sendToLuna(text);
  }

  async function submitPincode() {
    const pin = pincodeInput.trim();
    if (!/^\d{6}$/.test(pin)) return;
    setMessages((prev) => [...prev, { role: 'user', content: pin }]);
    const original = awaitingPincode;
    setAwaitingPincode(null);
    await sendToLuna(original, { pincode: pin });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') sendMessage();
  }

  function handlePincodeKeyDown(e) {
    if (e.key === 'Enter') submitPincode();
  }

  const unlimited = user?.tier === 'platinum';

  return (
    <div>
      <div className="disclaimer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span><b>LUNA is an AI assistant, not a doctor.</b> She offers general suggestions and temporary self-care ideas only — not diagnoses or prescriptions.</span>
        <span className={`badge ${user?.tier || 'free'}`}>
          {unlimited ? 'Unlimited · Platinum' : `${user?.tokenBalance ?? 0} tokens left · ${(user?.tier || 'free')[0].toUpperCase()}${(user?.tier || 'free').slice(1)}`}
        </span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="chat" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`} style={{ whiteSpace: 'pre-line' }}>{m.content}</div>
          ))}
          {loading && <div className="msg bot">Typing…</div>}
        </div>

        {outOfTokens ? (
          <div style={{ padding: '20px 20px 26px', textAlign: 'center' }}>
            <p style={{ marginBottom: 14 }}>You're out of AI tokens on your current plan.</p>
            <button className="btn btn-primary" onClick={() => navigate('/subscription')}>Upgrade your plan</button>
          </div>
        ) : awaitingPincode ? (
          <div className="chat-input">
            <input
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={handlePincodeKeyDown}
              placeholder="Enter your 6-digit pincode"
              inputMode="numeric"
            />
            <button className="btn btn-primary" style={{ borderRadius: '50%', width: 44, height: 44, padding: 0 }} onClick={submitPincode}>➤</button>
          </div>
        ) : (
          <>
            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask LUNA a health question..."
              />
              <button className="btn btn-primary" style={{ borderRadius: '50%', width: 44, height: 44, padding: 0 }} onClick={() => sendMessage()}>➤</button>
            </div>
          </>
        )}
      </div>

      {suggestedCare.length > 0 && (
        <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard/doctors')}>
          Open Doctors & Hospitals →
        </button>
      )}
    </div>
  );
}
