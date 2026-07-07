import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, resolveImg } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const nav = [
  { to: '/dashboard',           label: 'Overview',   end: true },
  { to: '/dashboard/profile',   label: 'Profile'   },
  { to: '/dashboard/skills',    label: 'Skills'    },
  { to: '/dashboard/projects',  label: 'Projects'  },
  { to: '/dashboard/categories',label: 'Categories'},
  { to: '/dashboard/preview',   label: 'Preview'   },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const pageTitle = nav.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Dashboard';

  return (
    <div style={s.shell}>
      {open && <div style={s.overlay} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`app-sidebar${open ? ' is-open' : ''}`} style={s.sidebar}>
        {/* Brand */}
        <div style={s.sidebarTop}>
          <div style={s.brandRow}>
            <span style={s.brandName}>PortfolioOS</span>
            <span style={s.brandPill}>CMS</span>
          </div>
          <p style={s.brandSub}>Portfolio CMS Dashboard</p>
        </div>

        {/* Navigation */}
        <nav style={s.nav}>
          <p style={s.navLabel}>Menu</p>
          {nav.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div style={s.sidebarFoot}>
          <div style={s.userRow}>
            <div style={s.avatar}>
              {user?.avatar
                ? <img src={`${resolveImg(user.avatar)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uEmail}>{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: 12, fontSize: 12.5 }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="app-main" style={s.main}>
        {/* Top header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <button className="menu-btn" style={s.menuBtn} onClick={() => setOpen(true)}>Menu</button>
            <span style={s.pageTitle}>{pageTitle}</span>
          </div>
          <div style={s.headerRight}>
            <a href={`/portfolio/${user?.id || user?._id}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ display: window.innerWidth < 480 ? 'none' : 'inline-flex' }}>
              View Public Page
            </a>
            <span style={s.headerDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <NotificationBell />
            <div style={s.avatarSm}>
              {user?.avatar
                ? <img src={`${resolveImg(user.avatar)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dash-content" style={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const s = {
  shell:   { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 },

  sidebar: {
    width: 230, background: 'var(--white)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, bottom: 0, left: 0,
    zIndex: 100,
  },
  sidebarTop: { padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' },
  brandRow:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 },
  brandName:  { fontSize: 15.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' },
  brandPill:  { background: 'var(--ink)', color: 'var(--white)', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4, letterSpacing: '0.04em' },
  brandSub:   { fontSize: 11.5, color: 'var(--text-3)', marginTop: 0 },

  nav:      { flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLabel: { fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: 6 },
  navItem:  { display: 'flex', alignItems: 'center', padding: '9px 12px', borderRadius: 'var(--r-sm)', color: 'var(--text-2)', textDecoration: 'none', fontSize: 13.5, fontWeight: 500, transition: 'all 0.12s' },
  navActive:{ background: 'var(--ink)', color: 'var(--white)', fontWeight: 600 },

  sidebarFoot: { padding: '14px 14px 18px', borderTop: '1px solid var(--border)' },
  userRow: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:  { width: 34, height: 34, background: 'var(--ink)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--white)', flexShrink: 0, overflow: 'hidden' },
  uName:   { fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  uEmail:  { fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 },

  main:    { flex: 1, marginLeft: 230, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56, background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 14 },
  menuBtn:     { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '5px 11px', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'none' },
  pageTitle:   { fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  headerDate:  { fontSize: 12, color: 'var(--text-3)' },
  avatarSm:    { width: 30, height: 30, background: 'var(--ink)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--white)', overflow: 'hidden' },

  content: { padding: '28px 32px', flex: 1 },
};
