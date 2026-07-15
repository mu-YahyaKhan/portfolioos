const express  = require('express');
const router   = express.Router();
const Project  = require('../models/Project');
const Activity = require('../models/Activity');
const upload   = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { uploadBuffer, deleteByUrl } = require('../utils/cloudinary');

// POST /api/projects/upload-image — upload a project cover image, returns its URL
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadBuffer(req.file.buffer, 'portfolioos/projects');
    res.json({ message: 'Image uploaded', url: result.secure_url });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/projects?search=&category=&status=
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = { user: req.user._id };
    if (category && category !== 'All') query.category = category;
    if (status   && status   !== 'All') query.status   = status;
    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [{ title: rx }, { description: rx }, { techStack: rx }];
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/projects/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const total      = await Project.countDocuments({ user: req.user._id });
    const featured   = await Project.countDocuments({ user: req.user._id, featured: true });
    const categories = await Project.distinct('category', { user: req.user._id });
    const byStatus   = await Project.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ total, featured, categories, byStatus });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, longDescription, techStack, category, liveUrl, githubUrl, imageUrl, status, featured } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
    const project = await Project.create({
      user: req.user._id, title, description,
      longDescription: longDescription || '',
      techStack: techStack || [],
      category: category || 'Uncategorized',
      liveUrl: liveUrl || '', githubUrl: githubUrl || '', imageUrl: imageUrl || '',
      status: status || 'Completed', featured: featured || false,
    });
    res.status(201).json({ message: 'Project added', project });
    await Activity.log(req.user._id, 'project_created', `Added project "${project.title}"`);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const oldImageUrl = project.imageUrl;
    const fields = ['title','description','longDescription','techStack','category','liveUrl','githubUrl','imageUrl','status','featured'];
    fields.forEach(f => { if (req.body[f] !== undefined) project[f] = req.body[f]; });
    await project.save();
    if (req.body.imageUrl !== undefined && oldImageUrl && oldImageUrl !== project.imageUrl) {
      await deleteByUrl(oldImageUrl); // old cover image was replaced or removed
    }
    res.json({ message: 'Project updated', project });
    await Activity.log(req.user._id, 'project_updated', `Updated project "${project.title}"`);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/projects/:id/image — remove just the cover image, keep the project
router.delete('/:id/image', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.imageUrl) await deleteByUrl(project.imageUrl);
    project.imageUrl = '';
    await project.save();
    res.json({ message: 'Image removed', project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.imageUrl) await deleteByUrl(project.imageUrl); // clean up its cover image too
    res.json({ message: 'Project deleted' });
    await Activity.log(req.user._id, 'project_deleted', `Deleted project "${project.title}"`);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
