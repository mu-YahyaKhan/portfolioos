import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.brand}>PortfolioOS</div>
        <h1 style={s.title}>Create your account</h1>
        <p style={s.sub}>Start building your portfolio today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 chars" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat" value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={s.foot}>Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box:   { width: '100%', maxWidth: 460, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '36px 32px', boxShadow: 'var(--shadow-md)' },
  brand: { fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 20, letterSpacing: '-0.02em' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' },
  sub:   { fontSize: 13, color: 'var(--text-3)', marginBottom: 24 },
  foot:  { textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text-3)' },
};
