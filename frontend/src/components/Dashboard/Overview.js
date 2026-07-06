import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Overview() {
  const { user, API } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await API.get('/dashboard/stats');
        if (!cancelled) setStats(data);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [API]);

  const hour = new Date().getHours();
  const hi   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statusBadge = s => {
    if (s === 'Completed')   return 'badge badge-success';
    if (s === 'In Progress') return 'badge badge-warning';
    return 'badge badge-default';
  };

  if (loading || !stats) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;

  const analyticsCards = [
    { label: 'Total Projects',  value: stats.totalProjects,   sub: 'In your portfolio'    },
    { label: 'Total Skills',    value: stats.totalSkills,     sub: 'Listed skills'        },
    { label: 'Categories',      value: stats.totalCategories, sub: 'Project categories'   },
    { label: 'Featured',        value: stats.featuredProjects,sub: 'Highlighted projects' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome banner */}
      <div style={s.banner}>
        <div>
          <p style={s.hi}>{hi},</p>
          <h1 style={s.name}>{user?.name || 'Developer'}</h1>
          <p style={s.role}>{user?.title || 'Set your professional title in Profile'}</p>
        </div>
        <div style={s.bannerActions}>
          <Link to="/dashboard/preview" className="btn btn-secondary btn-sm">Live Preview</Link>
          <Link to="/dashboard/projects" className="btn btn-primary btn-sm">Add Project</Link>
        </div>
      </div>

      {/* Analytics cards */}
      <div style={s.analyticsLabel}>Dashboard Analytics</div>
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {analyticsCards.map(({ label, value, sub }) => (
          <div key={label} className="card" style={s.statCard}>
            <div style={s.statValue}>{value}</div>
            <div style={s.statLabel}>{label}</div>
            <div style={s.statSub}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-two-col">
        {/* Recent activity */}
        <div className="card">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          {stats.recentActivities.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <h3>No activity yet</h3>
              <p>Your recent changes will show up here</p>
            </div>
          ) : (
            <div>
              {stats.recentActivities.map(a => (
                <div key={a._id} className="activity-item">
                  <span className="activity-dot" />
                  <div>
                    <div className="activity-text">{a.message}</div>
                    <div className="activity-time">{timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User stats / profile completion */}
        <div className="card">
          <div className="section-header"><h2>User Statistics</h2></div>
          <div style={{ marginBottom: 18 }}>
            <div style={s.statRow}>
              <span style={s.statRowLabel}>Profile Completion</span>
              <span style={s.statRowVal}>{stats.userStats.profileCompletion}%</span>
            </div>
            <div className="completion-bar-track" style={{ marginTop: 8 }}>
              <div className="completion-bar-fill" style={{ width: `${stats.userStats.profileCompletion}%` }} />
            </div>
          </div>
          <div style={s.miniGrid}>
            <div>
              <div style={s.miniLabel}>Member Since</div>
              <div style={s.miniVal}>{new Date(stats.userStats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            </div>
            <div>
              <div style={s.miniLabel}>Last Updated</div>
              <div style={s.miniVal}>{timeAgo(stats.userStats.lastUpdated)}</div>
            </div>
          </div>
          {stats.userStats.profileCompletion < 100 && (
            <Link to="/dashboard/profile" className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
              Complete Your Profile
            </Link>
          )}
        </div>
      </div>

      {/* Recent projects */}
      <div className="card" style={{ marginTop: 22 }}>
        <div className="section-header">
          <h2>Recently Updated Projects</h2>
          <Link to="/dashboard/projects" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Manage all</Link>
        </div>
        {stats.recentProjects.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <h3>No projects yet</h3>
            <p>Add your first project to get started</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Status</th>
                <th>Tech Stack</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentProjects.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td style={{ color: 'var(--text-2)' }}>{p.category}</td>
                  <td><span className={statusBadge(p.status)}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(p.techStack || []).slice(0, 3).map(t => (
                        <span key={t} className="tech-tag">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s = {
  banner: { background: 'var(--ink)', borderRadius: 'var(--r-lg)', padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  hi:     { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  name:   { fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 },
  role:   { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  bannerActions: { display: 'flex', gap: 10 },

  analyticsLabel: { fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 },
  statCard:  { padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 4 },
  statValue: { fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 },
  statLabel: { fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginTop: 4 },
  statSub:   { fontSize: 11.5, color: 'var(--text-3)' },

  twoCol: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 },

  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  statRowLabel: { fontSize: 13, color: 'var(--text-2)', fontWeight: 600 },
  statRowVal:   { fontSize: 18, color: 'var(--ink)', fontWeight: 800 },

  miniGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  miniLabel:{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 },
  miniVal:  { fontSize: 13.5, color: 'var(--text-1)', fontWeight: 700 },
};
