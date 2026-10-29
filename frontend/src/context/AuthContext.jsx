import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

// We use sessionStorage (not localStorage) on purpose: it persists across
// normal in-app navigation (dashboard <-> homepage <-> dashboard, refreshes)
// for as long as the browser tab/window stays open, but is cleared the
// moment the site is closed - so re-opening the site later asks to log in
// again, exactly like a typical "stay logged in for this session" flow.
function readSaved() {
  const saved = sessionStorage.getItem('herverse_user');
  return saved ? JSON.parse(saved) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSaved);

  const persist = (userData, token) => {
    sessionStorage.setItem('herverse_token', token);
    sessionStorage.setItem('herverse_user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = useCallback(async ({ name, phone, email, address, pincode, password, consentGiven }) => {
    const { data } = await api.post('/auth/signup', { name, phone, email, address, pincode, password, consentGiven });
    persist(data, data.token);
    return data;
  }, []);

  // Forgot-password via email OTP - three steps, none of these need an
  // auth token since the user isn't logged in yet.
  const requestPasswordOtp = useCallback(async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  }, []);

  const verifyPasswordOtp = useCallback(async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
    return data;
  }, []);

  const login = useCallback(async ({ phone, password }) => {
    const { data } = await api.post('/auth/login', { phone, password });
    persist(data, data.token);
    return data;
  }, []);

  // Separate flow for the admin panel's own login screen - hits a
  // dedicated endpoint that rejects non-admin accounts outright.
  const adminLogin = useCallback(async ({ phone, password }) => {
    const { data } = await api.post('/auth/admin-login', { phone, password });
    persist(data, data.token);
    return data;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('herverse_token');
    sessionStorage.removeItem('herverse_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      sessionStorage.setItem('herverse_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    sessionStorage.setItem('herverse_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, login, adminLogin, logout, updateUser, refreshUser, requestPasswordOtp, verifyPasswordOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
