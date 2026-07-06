const express  = require('express');
const router   = express.Router();
const Category = require('../models/Category');
const Project  = require('../models/Project');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/categories — list categories with live project counts
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    const counts = await Project.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((m, c) => { m[c._id] = c.count; return m; }, {});
    const withCounts = categories.map(c => ({ ...c.toObject(), projectCount: countMap[c.name] || 0 }));
    res.json({ categories: withCounts });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/categories
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Category name required' });
    const exists = await Category.findOne({ user: req.user._id, name: name.trim() });
    if (exists) return res.status(400).json({ message: 'A category with this name already exists' });
    const category = await Category.create({
      user: req.user._id, name: name.trim(), description: description || '', color: color || '#4f46e5',
    });
    await Activity.log(req.user._id, 'category_created', `Created category "${category.name}"`);
    res.status(201).json({ message: 'Category created', category: { ...category.toObject(), projectCount: 0 } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/categories/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { name, description, color } = req.body;
    const oldName = category.name;

    if (name !== undefined && name.trim() && name.trim() !== category.name) {
      const dup = await Category.findOne({ user: req.user._id, name: name.trim(), _id: { $ne: category._id } });
      if (dup) return res.status(400).json({ message: 'A category with this name already exists' });
      category.name = name.trim();
    }
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    await category.save();

    // Keep projects in sync with renamed category
    if (oldName !== category.name) {
      await Project.updateMany({ user: req.user._id, category: oldName }, { $set: { category: category.name } });
    }

    await Activity.log(req.user._id, 'category_updated', `Updated category "${category.name}"`);
    const projectCount = await Project.countDocuments({ user: req.user._id, category: category.name });
    res.json({ message: 'Category updated', category: { ...category.toObject(), projectCount } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/categories/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const inUse = await Project.countDocuments({ user: req.user._id, category: category.name });
    if (inUse > 0) {
      return res.status(400).json({
        message: `Cannot delete — ${inUse} project${inUse !== 1 ? 's' : ''} still use this category. Reassign them first.`,
      });
    }

    await category.deleteOne();
    await Activity.log(req.user._id, 'category_deleted', `Deleted category "${category.name}"`);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
