import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../Layout/ThemeToggle';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <ThemeToggle style={{ position: 'absolute', top: 20, right: 20 }} />
      <div style={s.box}>
        <div style={s.brand}>PortfolioOS</div>
        <h1 style={s.title}>Sign in to your account</h1>
        <p style={s.sub}>Manage your portfolio from one place</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={s.passWrap}>
              <input type={show ? 'text' : 'password'} placeholder="Your password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 70 }} />
              <button type="button" style={s.showBtn} onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.foot}>No account? <Link to="/register" style={{ fontWeight: 600 }}>Create one free</Link></p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box:  { width: '100%', maxWidth: 400, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '36px 32px', boxShadow: 'var(--shadow-md)' },
  brand:{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 20, letterSpacing: '-0.02em' },
  title:{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' },
  sub:  { fontSize: 13, color: 'var(--text-3)', marginBottom: 24 },
  passWrap: { position: 'relative' },
  showBtn:  { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', padding: 0 },
  foot: { textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text-3)' },
};
