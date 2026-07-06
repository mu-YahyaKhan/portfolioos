import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#0e7490', '#15803d', '#b45309', '#b91c1c', '#7c3aed', '#0369a1', '#be185d'];
const DEF = { name: '', description: '', color: COLORS[0] };

export default function CategoriesPage() {
  const { API } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(DEF);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, [API]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm(DEF); setModal(true); };
  const openEdit = c  => { setEditing(c); setForm({ name: c.name, description: c.description || '', color: c.color || COLORS[0] }); setModal(true); };
  const close    = () => { setModal(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Category name required');
    setSaving(true);
    try {
      if (editing) {
        const { data } = await API.put(`/categories/${editing._id}`, form);
        setCategories(categories.map(c => c._id === editing._id ? data.category : c));
        toast.success('Category updated');
      } else {
        const { data } = await API.post('/categories', form);
        setCategories([...categories, data.category]);
        toast.success('Category created');
      }
      close();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const del = async c => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await API.delete(`/categories/${c._id}`);
      setCategories(categories.filter(x => x._id !== c._id));
      toast.success('Category deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Organize your projects with custom categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Category</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state card">
          <h3>No categories yet</h3>
          <p>Create categories to organize and filter your projects</p>
        </div>
      ) : (
        <div style={s.grid}>
          {categories.map(c => (
            <div key={c._id} className="card" style={s.card}>
              <div style={s.cardTop}>
                <div style={s.titleRow}>
                  <span className="color-dot" style={{ background: c.color }} />
                  <span style={s.name}>{c.name}</span>
                </div>
                <span className="badge badge-default">{c.projectCount} project{c.projectCount !== 1 ? 's' : ''}</span>
              </div>
              {c.description && <p style={s.desc}>{c.description}</p>}
              <div style={s.actions}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="modal-close" onClick={close}>&#x2715;</button>
            </div>
            <div className="form-group">
              <label>Category Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Web App, Mobile App" autoFocus />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description of this category" />
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={s.colorRow}>
                {COLORS.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setForm({ ...form, color: col })}
                    style={{ ...s.colorSwatch, background: col, ...(form.color === col ? s.colorActive : {}) }}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Category'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  grid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card:   { padding: 20 },
  cardTop:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 9 },
  name:   { fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' },
  desc:   { fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 },
  actions:{ display: 'flex', gap: 8, marginTop: 6 },

  colorRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  colorSwatch: { width: 28, height: 28, borderRadius: 8, border: '2px solid transparent', cursor: 'pointer', padding: 0 },
  colorActive: { borderColor: 'var(--text-1)', boxShadow: '0 0 0 2px var(--white), 0 0 0 4px var(--ink-bd)' },
};
