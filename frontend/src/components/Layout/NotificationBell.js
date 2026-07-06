import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationBell() {
  const { API } = useAuth();
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const ref = useRef();

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  }, [API]);

  // Poll periodically so the badge stays current even without opening the panel
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) { setLoading(true); await load(); setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const markOneRead = async n => {
    if (n.isRead) return;
    try {
      await API.put(`/notifications/${n._id}/read`);
      setNotifications(ns => ns.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  return (
    <div style={s.wrap} ref={ref}>
      <button style={s.bellBtn} onClick={toggle} aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span style={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div style={s.panel}>
          <div style={s.panelHead}>
            <span style={s.panelTitle}>Notifications</span>
            {unreadCount > 0 && <button style={s.markAll} onClick={markAllRead}>Mark all read</button>}
          </div>
          <div style={s.list}>
            {loading ? (
              <div style={s.empty}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={s.empty}>You're all caught up</div>
            ) : (
              notifications.map(n => (
                <button key={n._id} style={{ ...s.item, ...(n.isRead ? {} : s.itemUnread) }} onClick={() => markOneRead(n)}>
                  {!n.isRead && <span style={s.dot} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={s.itemText}>{n.message}</div>
                    <div style={s.itemTime}>{timeAgo(n.createdAt)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { position: 'relative' },
  bellBtn: {
    position: 'relative', width: 32, height: 32, borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  badge: {
    position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, padding: '0 3px',
    borderRadius: 8, background: 'var(--red)', color: '#fff', fontSize: 9.5, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  },
  panel: {
    position: 'absolute', top: 40, right: 0, width: 320, maxHeight: 380, overflow: 'hidden',
    background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    boxShadow: 'var(--shadow-md)', zIndex: 200, display: 'flex', flexDirection: 'column',
  },
  panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' },
  panelTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-1)' },
  markAll: { background: 'none', border: 'none', color: 'var(--ink)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' },
  list: { overflowY: 'auto' },
  empty: { padding: '28px 14px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)' },
  item: {
    width: '100%', display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left',
    padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
  },
  itemUnread: { background: 'var(--ink-bg)' },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)', marginTop: 6, flexShrink: 0 },
  itemText: { fontSize: 12.5, color: 'var(--text-1)', fontWeight: 500, lineHeight: 1.4 },
  itemTime: { fontSize: 11, color: 'var(--text-3)', marginTop: 2 },
};
