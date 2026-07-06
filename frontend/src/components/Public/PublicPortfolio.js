import React from 'react';
import { SERVER } from '../../context/AuthContext';

export default function PublicPortfolio({ profile, projects = [], skills = [], categories = [] }) {
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

  const grouped = skills.reduce((acc, sk) => {
    (acc[sk.category] = acc[sk.category] || []).push(sk);
    return acc;
  }, {});

  const statusClass = st => st === 'Completed' ? 'badge badge-success' : st === 'In Progress' ? 'badge badge-warning' : 'badge badge-default';
  const catColor = name => categories.find(c => c.name === name)?.color || 'var(--ink)';

  return (
    <div style={s.page}>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.avatar}>
          {profile?.avatar
            ? <img src={`${SERVER}${profile.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <h1 style={s.heroName}>{profile?.name || 'Your Name'}</h1>
        <p style={s.heroTitle}>{profile?.title || 'Your Professional Title'}</p>
        {profile?.bio && <p style={s.heroBio}>{profile.bio}</p>}
        <div style={s.heroMeta}>
          {profile?.location && <span style={s.metaItem}>{profile.location}</span>}
          {profile?.website && <a href={profile.website} target="_blank" rel="noreferrer" style={s.metaLink}>Website</a>}
          {profile?.github && <a href={profile.github} target="_blank" rel="noreferrer" style={s.metaLink}>GitHub</a>}
          {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={s.metaLink}>LinkedIn</a>}
        </div>
      </section>

      {profile?.about && (
        <section style={s.section}>
          <h2 style={s.sectionTitle}>About</h2>
          <p style={s.about}>{profile.about}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Skills</h2>
          <div style={s.skillsGrid}>
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} style={s.skillCard}>
                <div style={s.skillCatName}>{cat}</div>
                {list.map(sk => (
                  <div key={sk._id} style={{ marginBottom: 10 }}>
                    <div style={s.skillRow}>
                      <span style={s.skillName}>{sk.name}</span>
                      <span style={s.skillPct}>{sk.level}%</span>
                    </div>
                    <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: `${sk.level}%` }} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Projects</h2>
          <div style={s.projGrid}>
            {projects.map(p => (
              <div key={p._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {p.imageUrl && (
                  <div style={s.imgWrap}>
                    <img src={p.imageUrl.startsWith('/uploads') ? `${SERVER}${p.imageUrl}` : p.imageUrl} alt={p.title} style={s.img} onError={e => { e.target.parentElement.style.display = 'none'; }} />
                  </div>
                )}
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className={statusClass(p.status)}>{p.status}</span>
                    <span className="badge" style={{ background: '#fff', borderColor: catColor(p.category), color: catColor(p.category) }}>{p.category}</span>
                    {p.featured && <span className="badge badge-warning">Featured</span>}
                  </div>
                  <h3 style={s.projTitle}>{p.title}</h3>
                  <p style={s.projDesc}>{p.description}</p>
                  {p.techStack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                      {p.techStack.map(t => <span key={t} className="tech-tag">{t}</span>)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 14 }}>
                    {p.liveUrl   && <a href={p.liveUrl}   target="_blank" rel="noreferrer" style={s.link}>Live Demo</a>}
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={s.link}>Source Code</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {profile?.email && (
        <section style={{ ...s.section, textAlign: 'center' }}>
          <h2 style={s.sectionTitle}>Get in Touch</h2>
          <a href={`mailto:${profile.email}`} className="btn btn-primary">{profile.email}</a>
        </section>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: 880, margin: '0 auto', padding: '40px 20px 80px' },
  hero: { textAlign: 'center', padding: '20px 0 36px' },
  avatar: { width: 96, height: 96, borderRadius: 24, background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, margin: '0 auto 18px', overflow: 'hidden' },
  heroName: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 4 },
  heroTitle:{ fontSize: 15, color: 'var(--ink)', fontWeight: 600, marginBottom: 12 },
  heroBio:  { fontSize: 14, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.6 },
  heroMeta: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  metaItem: { fontSize: 12.5, color: 'var(--text-3)' },
  metaLink: { fontSize: 12.5, color: 'var(--ink)', fontWeight: 600 },

  section: { marginTop: 36 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' },
  about: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, whiteSpace: 'pre-wrap' },

  skillsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  skillCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 18 },
  skillCatName: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink)', marginBottom: 12 },
  skillRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  skillName:{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' },
  skillPct: { fontSize: 11.5, color: 'var(--text-3)' },

  projGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 },
  imgWrap:  { width: '100%', height: 170, overflow: 'hidden', background: 'var(--bg)' },
  img:      { width: '100%', height: '100%', objectFit: 'cover' },
  projTitle:{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 },
  projDesc: { fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 12 },
  link:     { fontSize: 12.5, color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline' },
};
