import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, SERVER } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUSES = ['Completed','In Progress','On Hold'];
const DEF = { title: '', description: '', longDescription: '', techStack: '', category: '', status: 'Completed', liveUrl: '', githubUrl: '', imageUrl: '', featured: false };

const statusClass = s => s === 'Completed' ? 'badge badge-success' : s === 'In Progress' ? 'badge badge-warning' : 'badge badge-default';
const resolveImg  = url => (url && url.startsWith('/uploads')) ? `${SERVER}${url}` : url;

export default function ProjectsPage() {
  const { API } = useAuth();
  const fileRef = useRef();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(DEF);
  const [saving, setSaving]     = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Search & filter state
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch { /* silent */ }
  }, [API]);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (search)                        params.search   = search;
      if (catFilter    !== 'All')        params.category = catFilter;
      if (statusFilter !== 'All')        params.status   = statusFilter;
      const { data } = await API.get('/projects', { params });
      setProjects(data.projects || []);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [API, search, catFilter, statusFilter]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm({ ...DEF, category: categories[0]?.name || 'Uncategorized' }); setModal(true); };
  const openEdit = p  => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, longDescription: p.longDescription || '',
      techStack: (p.techStack || []).join(', '), category: p.category || (categories[0]?.name || 'Uncategorized'),
      status: p.status, liveUrl: p.liveUrl || '', githubUrl: p.githubUrl || '',
      imageUrl: p.imageUrl || '', featured: p.featured || false });
    setModal(true);
  };
  const close = () => { setModal(false); setEditing(null); };
  const set   = k => e => setForm({ ...form, [k]: e.target.value });

  const handleImageFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploadingImg(true);
    try {
      const { data } = await API.post('/projects/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, imageUrl: data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploadingImg(false); }
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description required');
    setSaving(true);
    const payload = { ...form, techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        const { data } = await API.put(`/projects/${editing._id}`, payload);
        setProjects(projects.map(p => p._id === editing._id ? data.project : p));
        toast.success('Project updated');
      } else {
        const { data } = await API.post('/projects', payload);
        setProjects([data.project, ...projects]);
        toast.success('Project added');
      }
      close();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleFeatured = async p => {
    try {
      const { data } = await API.put(`/projects/${p._id}`, { featured: !p.featured });
      setProjects(projects.map(x => x._id === p._id ? data.project : x));
      toast.success(data.project.featured ? 'Marked as featured' : 'Removed from featured');
    } catch { toast.error('Update failed'); }
  };

  const clearFilters = () => { setSearch(''); setCatFilter('All'); setStatusFilter('All'); };
  const hasFilter    = search || catFilter !== 'All' || statusFilter !== 'All';
  const categoryNames = categories.map(c => c.name);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Project Management</h1>
          <p className="page-subtitle">Add, edit, delete and categorize your projects</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Project</button>
      </div>

      {/* Search and Filter bar */}
      <div className="card" style={{ marginBottom: 20, padding: '18px 22px' }}>
        <div style={s.filterBar}>
          <div className="search-box" style={s.searchWrap}>
            <input
              placeholder="Search by title, description or tech stack..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={s.searchInput}
            />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={s.select}>
            <option value="All">All Categories</option>
            {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={s.select}>
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {hasFilter && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
          )}
        </div>
        <div style={s.filterMeta}>
          Showing <strong>{projects.length}</strong> project{projects.length !== 1 ? 's' : ''}
          {hasFilter && ' (filtered)'}
        </div>
      </div>

      {/* Category quick filter pills */}
      <div style={s.pills}>
        {['All', ...categoryNames].map(c => (
          <button key={c} style={{ ...s.pill, ...(catFilter === c ? s.pillActive : {}) }} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Projects grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state card">
          <h3>{hasFilter ? 'No projects match your search' : 'No projects yet'}</h3>
          <p>{hasFilter ? 'Try clearing filters or a different search term' : 'Add your first project to get started'}</p>
        </div>
      ) : (
        <div style={s.grid}>
          {projects.map(p => (
            <div key={p._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {p.imageUrl && (
                <div style={s.imgWrap}>
                  <img src={resolveImg(p.imageUrl)} alt={p.title} style={s.img} onError={e => { e.target.parentElement.style.display = 'none'; }} />
                </div>
              )}
              <div style={{ padding: 18 }}>
                <div style={s.cardTop}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={statusClass(p.status)}>{p.status}</span>
                    <span className="badge badge-blue">{p.category}</span>
                  </div>
                  <button
                    style={{ ...s.starBtn, ...(p.featured ? s.starActive : {}) }}
                    onClick={() => toggleFeatured(p)}
                    title={p.featured ? 'Remove featured' : 'Mark featured'}
                  >
                    {p.featured ? '★' : '☆'}
                  </button>
                </div>
                <h3 style={s.cardTitle}>{p.title}</h3>
                <p style={s.cardDesc}>{p.description}</p>
                {p.techStack?.length > 0 && (
                  <div style={s.techRow}>
                    {p.techStack.slice(0, 4).map(t => <span key={t} className="tech-tag">{t}</span>)}
                    {p.techStack.length > 4 && <span className="tech-tag">+{p.techStack.length - 4}</span>}
                  </div>
                )}
                <div style={s.cardFoot}>
                  <div style={s.links}>
                    {p.liveUrl   && <a href={p.liveUrl}   target="_blank" rel="noreferrer" style={s.link}>Live</a>}
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={s.link}>GitHub</a>}
                  </div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm"    onClick={() => del(p._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="modal-close" onClick={close}>&#x2715;</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Project Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="My Awesome App" autoFocus />
              </div>
              <div className="form-group">
                <label>Category</label>
                {categoryNames.length === 0 ? (
                  <input value={form.category} onChange={set('category')} placeholder="Create a category first" />
                ) : (
                  <select value={form.category} onChange={set('category')}>
                    {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={set('status')}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tech Stack (comma separated)</label>
                <input value={form.techStack} onChange={set('techStack')} placeholder="React, Node.js, MongoDB" />
              </div>
            </div>

            <div className="form-group">
              <label>Short Description *</label>
              <input value={form.description} onChange={set('description')} placeholder="A brief summary of the project..." />
            </div>

            <div className="form-group">
              <label>Detailed Description</label>
              <textarea value={form.longDescription} onChange={set('longDescription')} style={{ minHeight: 90 }}
                placeholder="Full details, challenges, what you learned..." />
            </div>

            <div className="form-row">
              <div className="form-group"><label>Live URL</label><input value={form.liveUrl} onChange={set('liveUrl')} placeholder="https://myapp.com" /></div>
              <div className="form-group"><label>GitHub URL</label><input value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/..." /></div>
            </div>

            <div className="form-group">
              <label>Project Image</label>
              <div style={s.imgUploadRow}>
                {form.imageUrl && (
                  <div style={s.imgPreviewWrap}>
                    <img src={resolveImg(form.imageUrl)} alt="" style={s.imgPreview} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleImageFile} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()} disabled={uploadingImg}>
                    {uploadingImg ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="or paste an image URL"
                    style={{ marginTop: 8 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <input type="checkbox" id="feat" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
              <label htmlFor="feat" style={{ margin: 0, fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500, cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal' }}>
                Mark as Featured Project
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  filterBar:   { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 },
  searchWrap:  { flex: 1, minWidth: 220 },
  searchInput: { width: '100%', height: 36 },
  select:      { width: 'auto', minWidth: 150, height: 36, padding: '0 12px', fontSize: 13, cursor: 'pointer' },
  filterMeta:  { fontSize: 12, color: 'var(--text-3)' },

  pills:      { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 },
  pill:       { padding: '5px 13px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s' },
  pillActive: { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' },

  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  imgWrap:   { width: '100%', height: 170, overflow: 'hidden', background: 'var(--bg)' },
  img:       { width: '100%', height: '100%', objectFit: 'cover' },
  cardTop:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  starBtn:   { background: 'none', border: 'none', fontSize: 18, color: 'var(--text-3)', cursor: 'pointer', padding: 0, lineHeight: 1 },
  starActive:{ color: '#d97706' },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-1)', letterSpacing: '-0.01em' },
  cardDesc:  { fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  techRow:   { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 },
  cardFoot:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' },
  links:     { display: 'flex', gap: 12 },
  link:      { fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, textDecoration: 'underline' },

  imgUploadRow: { display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' },
  imgPreviewWrap: { width: 90, height: 70, borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg)' },
  imgPreview: { width: '100%', height: '100%', objectFit: 'cover' },
};
