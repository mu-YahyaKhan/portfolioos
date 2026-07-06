const express = require('express');
const router  = express.Router();
const Skill   = require('../models/Skill');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ category: 1, name: 1 });
    res.json({ skills });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, category, level } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Name and category required' });
    const skill = await Skill.create({ user: req.user._id, name, category, level: level || 50 });
    res.status(201).json({ message: 'Skill added', skill });
    await Activity.log(req.user._id, 'skill_created', `Added skill "${skill.name}"`);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    const { name, category, level } = req.body;
    if (name !== undefined) skill.name = name;
    if (category !== undefined) skill.category = category;
    if (level !== undefined) skill.level = level;
    await skill.save();
    res.json({ message: 'Skill updated', skill });
    await Activity.log(req.user._id, 'skill_updated', `Updated skill "${skill.name}"`);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted' });
    await Activity.log(req.user._id, 'skill_deleted', `Deleted skill "${skill.name}"`);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
