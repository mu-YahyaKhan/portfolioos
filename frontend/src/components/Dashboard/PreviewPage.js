import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import PublicPortfolio from '../Public/PublicPortfolio';
import toast from 'react-hot-toast';

export default function PreviewPage() {
  const { API, user } = useAuth();
  const [projects, setProjects]     = useState([]);
  const [skills, setSkills]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        API.get('/projects'), API.get('/skills'), API.get('/categories'),
      ]);
      setProjects(pRes.data.projects || []);
      setSkills(sRes.data.skills || []);
      setCategories(cRes.data.categories || []);
    } catch { toast.error('Failed to load preview'); }
    finally { setLoading(false); }
  }, [API]);

  // Re-fetch every time this page is opened so it always mirrors the latest dashboard edits
  useEffect(() => { load(); }, [load]);

  const userId = user?.id || user?._id;
  const publicUrl = `${window.location.origin}/portfolio/${userId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Public link copied to clipboard');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Live Portfolio Preview</h1>
          <p className="page-subtitle">This is exactly what visitors see — refresh after editing to confirm changes</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
          <button className="btn btn-secondary" onClick={copyLink}>Copy Public Link</button>
          <a className="btn btn-primary" href={`/portfolio/${userId}`} target="_blank" rel="noreferrer">Open in New Tab</a>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '10px 16px', fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
            {publicUrl}
          </div>
          <PublicPortfolio profile={{ ...user, avatar: user?.avatar }} projects={projects} skills={skills} categories={categories} />
        </div>
      )}
    </div>
  );
}
