import React, { useState, useEffect, useRef } from 'react';
import { useAuth, resolveImg } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = ['Personal', 'About', 'Contact', 'Security'];

export default function ProfilePage() {
  const { user, API, updateUser } = useAuth();
  const fileRef = useRef();
  const [tab, setTab]         = useState('Personal');
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', title: '', bio: '', about: '', location: '',
    email: '', phone: '', website: '', github: '', linkedin: '', twitter: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', title: user.title || '', bio: user.bio || '',
        about: user.about || '', location: user.location || '',
        email: user.email || '', phone: user.phone || '',
        website: user.website || '', github: user.github || '',
        linkedin: user.linkedin || '', twitter: user.twitter || '',
      });
    }
  }, [user]);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/portfolio', form);
      updateUser(data.portfolio);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleAvatar = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await API.post('/portfolio/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.portfolio);
      toast.success('Profile image updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Fill in all password fields');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('New passwords do not match');
    setPwSaving(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Profile Management</h1>
          <p className="page-subtitle">Update your personal information, about section and contact details</p>
        </div>
        {tab !== 'Security' && (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Avatar upload */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={s.avatarBig}>
          {user?.avatar
            ? <img src={`${resolveImg(user.avatar)}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14 }}>{user?.title || 'No title set'}</div>
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleAvatar} />
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Profile Image'}
          </button>
          <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>JPG, PNG or WebP. Max 5 MB.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 28 }}>
        {tab === 'Personal' && (
          <>
            <h3 style={s.sH}>Personal Information</h3>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={set('name')} placeholder="John Doe" /></div>
              <div className="form-group"><label>Professional Title</label><input value={form.title} onChange={set('title')} placeholder="Full Stack Developer" /></div>
            </div>
            <div className="form-group"><label>Short Bio</label><input value={form.bio} onChange={set('bio')} placeholder="A one-line professional summary..." /></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={set('location')} placeholder="Karachi, Pakistan" /></div>
          </>
        )}

        {tab === 'About' && (
          <>
            <h3 style={s.sH}>About Section</h3>
            <p style={s.sDesc}>Write a detailed description about yourself, your journey, and expertise.</p>
            <div className="form-group">
              <label>About Me</label>
              <textarea value={form.about} onChange={set('about')} style={{ minHeight: 200 }}
                placeholder="Share your story, passion, experience and what makes you unique as a developer..." />
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-3)', marginTop: -10 }}>{form.about.length} characters</div>
          </>
        )}

        {tab === 'Contact' && (
          <>
            <h3 style={s.sH}>Contact Information</h3>
            <div className="form-row">
              <div className="form-group"><label>Email Address</label><input value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
              <div className="form-group"><label>Phone Number</label><input value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" /></div>
            </div>
            <div className="form-group"><label>Website URL</label><input value={form.website} onChange={set('website')} placeholder="https://yourwebsite.com" /></div>
            <div className="divider" />
            <h3 style={{ ...s.sH, marginBottom: 16 }}>Social Links</h3>
            <div className="form-row">
              <div className="form-group"><label>GitHub</label><input value={form.github} onChange={set('github')} placeholder="github.com/username" /></div>
              <div className="form-group"><label>LinkedIn</label><input value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/username" /></div>
            </div>
            <div className="form-group" style={{ maxWidth: 320 }}>
              <label>Twitter / X</label>
              <input value={form.twitter} onChange={set('twitter')} placeholder="twitter.com/username" />
            </div>
          </>
        )}
        {tab === 'Security' && (
          <>
            <h3 style={s.sH}>Change Password</h3>
            <p style={s.sDesc}>Choose a strong password you don't use elsewhere. You'll need your current password to confirm the change.</p>
            <div className="form-group" style={{ maxWidth: 360 }}>
              <label>Current Password</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="form-row" style={{ maxWidth: 360 }}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="At least 6 characters" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Re-enter new password" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwSaving} style={{ marginTop: 6 }}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  avatarBig: { width: 72, height: 72, background: 'var(--ink)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' },
  tabs:      { display: 'flex', gap: 4, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 4, marginBottom: 16, width: 'fit-content' },
  tab:       { padding: '7px 18px', borderRadius: 5, border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.12s' },
  tabActive: { background: 'var(--ink)', color: 'var(--white)', fontWeight: 600 },
  sH:        { fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-1)' },
  sDesc:     { fontSize: 13, color: 'var(--text-3)', marginBottom: 18 },
};
