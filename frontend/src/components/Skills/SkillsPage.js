import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATS = ['Frontend','Backend','Database','DevOps','Mobile','Design','Other'];
const DEF  = { name: '', category: 'Frontend', level: 70 };

export default function SkillsPage() {
  const { API } = useAuth();
  const [skills, setSkills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(DEF);
  const [saving, setSaving]   = useState(false);
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/skills');
      setSkills(data.skills || []);
    } catch { toast.error('Failed to load skills'); }
    finally { setLoading(false); }
  }, [API]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm(DEF); setModal(true); };
  const openEdit = sk => { setEditing(sk); setForm({ name: sk.name, category: sk.category, level: sk.level }); setModal(true); };
  const close    = () => { setModal(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Skill name required');
    setSaving(true);
    try {
      if (editing) {
        const { data } = await API.put(`/skills/${editing._id}`, form);
        setSkills(skills.map(s => s._id === editing._id ? data.skill : s));
        toast.success('Skill updated');
      } else {
        const { data } = await API.post('/skills', form);
        setSkills([...skills, data.skill]);
        toast.success('Skill added');
      }
      close();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await API.delete(`/skills/${id}`);
      setSkills(skills.filter(s => s._id !== id));
      toast.success('Skill deleted');
    } catch { toast.error('Delete failed'); }
  };

  const cats     = ['All', ...CATS.filter(c => skills.some(s => s.category === c))];
  const filtered = skills
    .filter(s => filter === 'All' || s.category === filter)
    .filter(s => !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase()));

  // group by category
  const grouped = CATS.reduce((acc, c) => {
    const list = filtered.filter(s => s.category === c);
    if (list.length) acc[c] = list;
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Skills Management</h1>
          <p className="page-subtitle">Add, edit and delete your technical skills</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Skill</button>
      </div>

      {/* Summary row */}
      <div style={s.summaryRow}>
        <div style={s.summaryItem}><span style={s.summaryVal}>{skills.length}</span><span style={s.summaryLbl}>Total Skills</span></div>
        {CATS.filter(c => skills.some(sk => sk.category === c)).map(c => (
          <div key={c} style={s.summaryItem}>
            <span style={s.summaryVal}>{skills.filter(sk => sk.category === c).length}</span>
            <span style={s.summaryLbl}>{c}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 14 }}>
        <input
          placeholder="Search skills by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ height: 36 }}
        />
      </div>

      {/* Filter tabs */}
      <div style={s.filterRow}>
        {cats.map(c => (
          <button key={c} style={{ ...s.filterBtn, ...(filter === c ? s.filterActive : {}) }} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : skills.length === 0 ? (
        <div className="empty-state card"><h3>No skills added yet</h3><p>Click "Add Skill" to get started</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card"><h3>No skills match your search</h3><p>Try a different keyword or category</p></div>
      ) : (
        <div style={s.grid}>
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} className="card" style={{ padding: 22 }}>
              <div style={s.catHeader}>
                <span style={s.catName}>{cat}</span>
                <span style={s.catCount}>{list.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {list.map(sk => (
                  <div key={sk._id}>
                    <div style={s.skillRow}>
                      <span style={s.skillName}>{sk.name}</span>
                      <div style={s.skillActions}>
                        <span style={s.skillPct}>{sk.level}%</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(sk)}>Edit</button>
                        <button className="btn btn-danger btn-sm"    onClick={() => del(sk._id)}>Delete</button>
                      </div>
                    </div>
                    <div className="skill-bar-track" style={{ marginTop: 8 }}>
                      <div className="skill-bar-fill" style={{ width: `${sk.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Skill' : 'Add New Skill'}</h2>
              <button className="modal-close" onClick={close}>&#x2715;</button>
            </div>
            <div className="form-group">
              <label>Skill Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. React, Python, Figma" autoFocus />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Proficiency Level — <strong>{form.level}%</strong></label>
              <input type="range" min={1} max={100} value={form.level} onChange={e => setForm({ ...form, level: +e.target.value })} style={{ width: '100%', marginTop: 8 }} />
              <div className="skill-bar-track" style={{ marginTop: 10 }}>
                <div className="skill-bar-fill" style={{ width: `${form.level}%` }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Skill'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  summaryRow:  { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  summaryItem: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 2 },
  summaryVal:  { fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' },
  summaryLbl:  { fontSize: 11.5, color: 'var(--text-3)', fontWeight: 500 },

  filterRow:   { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 },
  filterBtn:   { padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text-2)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s' },
  filterActive:{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' },

  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  catHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' },
  catName:     { fontSize: 13, fontWeight: 700, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  catCount:    { fontSize: 11.5, color: 'var(--text-3)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 5, padding: '1px 8px', fontWeight: 600 },

  skillRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  skillName:   { fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' },
  skillActions:{ display: 'flex', alignItems: 'center', gap: 6 },
  skillPct:    { fontSize: 12, color: 'var(--text-3)', minWidth: 32, textAlign: 'right' },
};
