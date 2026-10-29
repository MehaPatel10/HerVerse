import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function ForgotPasswordFlow({ onDone }) {
  const { requestPasswordOtp, verifyPasswordOtp, resetPassword } = useAuth();
  const [step, setStep] = useState('email'); // email -> otp -> newPassword -> done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email.trim()) return setError('Enter the email address on your account.');
    setBusy(true);
    try {
      const data = await requestPasswordOtp(email.trim());
      setInfo(data.message || 'If that email is registered, a code has been sent to it.');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    if (!otp.trim()) return setError('Enter the 6-digit code sent to your email.');
    setBusy(true);
    try {
      await verifyPasswordOtp(email.trim(), otp.trim());
      setStep('newPassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords don\u2019t match.');
    setBusy(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset your password.');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: 18 }}>✓ Your password has been reset. You can log in with it now.</p>
        <button className="btn btn-primary btn-block" onClick={onDone}>Back to login</button>
      </div>
    );
  }

  return (
    <div>
      {step === 'email' && (
        <form onSubmit={handleSendOtp}>
          <p className="muted" style={{ marginBottom: 16 }}>Enter your account email — we'll send a 6-digit verification code.</p>
          <div className="field"><label>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Sending…' : 'Send code'}</button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          {info && <p style={{ fontSize: 12.5, color: 'var(--sage-700, #4B7A5A)', marginBottom: 12 }}>{info}</p>}
          <div className="field"><label>6-digit code</label><input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} /></div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Verifying…' : 'Verify code'}</button>
        </form>
      )}
      {step === 'newPassword' && (
        <form onSubmit={handleReset}>
          <div className="field"><label>New password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" /></div>
          <div className="field"><label>Confirm new password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Updating…' : 'Reset password'}</button>
        </form>
      )}
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-soft)', marginTop: 16 }}>
        <a onClick={onDone} style={{ color: 'var(--rose-600)', fontWeight: 500, cursor: 'pointer' }}>← Back to login</a>
      </div>
    </div>
  );
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'login' ? 'login' : searchParams.get('mode') === 'signup' ? 'signup' : 'signup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        if (!name || !phone || !email || !address || !pincode || !password) {
          return setError('Name, phone, email, address, pincode and password are all required.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return setError('Enter a valid email address.');
        }
        if (!/^\d{6}$/.test(pincode.trim())) {
          return setError('Enter a valid 6-digit pincode.');
        }
        if (!consent) return setError('Please accept the data consent to create your account.');
        await signup({ name, phone, email: email.trim(), address, pincode: pincode.trim(), password, consentGiven: consent });
        navigate('/subscription');
      } else {
        if (!phone || !password) return setError('Enter your phone number and password.');
        await login({ phone, password });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  }

  if (mode === 'forgot') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, marginBottom: 18, textAlign: 'center' }}>Reset your password</h2>
          <ForgotPasswordFlow onDone={() => setMode('login')} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', background: 'var(--rose-100)', borderRadius: 30, padding: 4, marginBottom: 26 }}>
          <button
            onClick={() => setMode('signup')}
            style={{ flex: 1, padding: 10, borderRadius: 26, fontSize: 14, fontWeight: 500, color: mode === 'signup' ? '#fff' : 'var(--rose-700)', background: mode === 'signup' ? 'var(--rose-600)' : 'transparent' }}
          >
            Sign up
          </button>
          <button
            onClick={() => setMode('login')}
            style={{ flex: 1, padding: 10, borderRadius: 26, fontSize: 14, fontWeight: 500, color: mode === 'login' ? '#fff' : 'var(--rose-700)', background: mode === 'login' ? 'var(--rose-600)' : 'transparent' }}
          >
            Log in
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" />
            </div>
          )}
          <div className="field">
            <label>Phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>

          {mode === 'signup' && (
            <>
              <div className="field">
                <label>Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="field">
                <label>Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / street / area, city" />
              </div>
              <div className="field">
                <label>Pincode</label>
                <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="380009" inputMode="numeric" />
                <p className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Used by LUNA to find nearby doctors & hospitals when you need them.</p>
              </div>
            </>
          )}

          <div className="field">
            <label>{mode === 'signup' ? 'Create password' : 'Password'}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>

          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: 10, background: 'var(--rose-50)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
              <p style={{ fontSize: 12.5, color: 'var(--text-soft)', lineHeight: 1.5 }}>
                I consent to HERVERSE collecting and processing my personal and health data to provide cycle predictions and personalized insights.
              </p>
            </div>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <a onClick={() => setMode('forgot')} style={{ color: 'var(--rose-600)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Forgot password?</a>
            </div>
          )}

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block">
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-soft)', marginTop: 20 }}>
          {mode === 'signup' ? (
            <>Already have an account? <a onClick={() => setMode('login')} style={{ color: 'var(--rose-600)', fontWeight: 500, cursor: 'pointer' }}>Log in</a></>
          ) : (
            <>New to HERVERSE? <a onClick={() => setMode('signup')} style={{ color: 'var(--rose-600)', fontWeight: 500, cursor: 'pointer' }}>Sign up</a></>
          )}
        </div>
      </div>
    </div>
  );
}
