import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axiosClient.js';

const TIER_BADGE = { free: 'free', gold: 'gold', platinum: 'platinum' };

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Subscription() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [payConfig, setPayConfig] = useState({ demoMode: true });
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/pricing').then(({ data }) => setPlans(data)).catch(() => {});
    api.get('/payments/config').then(({ data }) => setPayConfig(data)).catch(() => {});
  }, []);

  // After a successful subscription payment (Gold/Platinum), we send the
  // person straight to Complete Profile instead of showing an inline
  // message - this is where they set up the info Settings & the diet/health
  // features rely on. Token-pack purchases just show a short confirmation.
  async function afterPaymentSuccess(type, label) {
    await refreshUser();
    if (type === 'subscription') {
      navigate('/complete-profile');
      return;
    }
    setMessage(`${label} added to your account.`);
  }

  async function checkout(type, refId, freeLabel) {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
    setMessage('');
    setBusy(refId);
    try {
      const { data } = await api.post('/payments/create-order', { type, refId });

      if (data.demoMode) {
        // No live Razorpay keys configured yet - simulate the payment directly.
        await api.post('/payments/verify', { paymentId: data.paymentId });
        await afterPaymentSuccess(type, data.label);
        setBusy('');
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        setMessage('Could not load the payment widget. Please check your connection and try again.');
        setBusy('');
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: Math.round(data.amountINR * 100),
        currency: 'INR',
        order_id: data.orderId,
        name: 'HERVERSE',
        description: data.label,
        handler: async (response) => {
          await api.post('/payments/verify', {
            paymentId: data.paymentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          await afterPaymentSuccess(type, data.label);
        },
        theme: { color: '#A44A6B' }
      });
      rzp.on('payment.failed', () => setMessage('Payment failed or was cancelled. Please try again.'));
      rzp.open();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong starting the payment.');
    } finally {
      setBusy('');
    }
  }

  async function chooseFreePlan() {
    if (!user) return navigate('/auth?mode=signup');
    navigate('/complete-profile');
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '50px 24px 70px' }}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h1 style={{ fontSize: 32 }}>Pick the plan that fits your journey</h1>
        <p className="muted" style={{ marginTop: 8 }}>Prices are in ₹ per month and can change any time — you'll always see the current price here.</p>
        {payConfig.demoMode && (
          <div className="disclaimer" style={{ maxWidth: 520, margin: '18px auto 0' }}>
            This is a demo site. Payments are simulated — no real money is charged.
          </div>
        )}
      </div>

      {message && <div className="card" style={{ margin: '20px auto', maxWidth: 520, textAlign: 'center', background: 'var(--sage-100)', border: 'none' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 30 }}>
        {plans.map((p) => {
          const isCurrent = user && user.tier === p.tier;
          return (
            <div key={p.tier} className={`card plan-pick ${isCurrent ? 'current' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {isCurrent && <span className="current-tag">Current plan</span>}
              <span className={`badge ${TIER_BADGE[p.tier]}`} style={{ width: 'fit-content', marginBottom: 10 }}>{p.label}</span>
              <div className="serif" style={{ fontSize: 30, margin: '4px 0' }}>
                {p.priceINR > 0 ? `₹${p.priceINR}` : 'Free'}
                {p.priceINR > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}> / month</span>}
              </div>
              <div className="muted" style={{ marginBottom: 10 }}>
                {p.monthlyTokens === -1 ? 'Unlimited AI tokens' : `${p.monthlyTokens} AI tokens / month`}
              </div>
              <ul style={{ listStyle: 'none', margin: '10px 0 24px', flex: 1 }}>
                {(p.features || []).map((f) => (
                  <li key={f} style={{ fontSize: 13.5, color: 'var(--text-soft)', padding: '6px 0' }}>✓ {f}</li>
                ))}
              </ul>
              {isCurrent ? (
                <button className="btn btn-outline btn-block" disabled>Your current plan</button>
              ) : p.priceINR === 0 ? (
                <button className="btn btn-primary btn-block" onClick={chooseFreePlan}>
                  {user ? 'Switch to Free' : 'Get Started Free'}
                </button>
              ) : (
                <button className="btn btn-primary btn-block" disabled={busy === p.tier} onClick={() => checkout('subscription', p.tier, p.label)}>
                  {busy === p.tier ? 'Processing…' : `Upgrade to ${p.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
