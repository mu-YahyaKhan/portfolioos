import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PublicPortfolio from './PublicPortfolio';

export default function PublicPortfolioPage() {
  const { userId } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios.get(`/api/public/${userId}`)
      .then(r => { if (!cancelled) setData(r.data); })
      .catch(() => { if (!cancelled) setError('This portfolio could not be found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }
  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="empty-state card" style={{ maxWidth: 380 }}>
          <h3>Portfolio not found</h3>
          <p>{error || 'This link is invalid or the portfolio has been removed.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PublicPortfolio profile={data.profile} projects={data.projects} skills={data.skills} categories={data.categories} />
    </div>
  );
}
