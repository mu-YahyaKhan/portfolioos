const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const upload  = require('../middleware/upload');
const { uploadBuffer, deleteByUrl } = require('../utils/cloudinary');

// GET /api/portfolio
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ portfolio: user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/portfolio  — update personal / about / contact
router.put('/', protect, async (req, res) => {
  try {
    const fields = ['name','title','bio','about','location','phone','website','github','linkedin','twitter'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true });
    res.json({ message: 'Portfolio updated', portfolio: user });
    await Activity.log(req.user._id, 'profile_updated', 'Updated profile information');
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/portfolio/avatar  — upload profile image (replaces any existing one)
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const existing = await User.findById(req.user._id);
    const result = await uploadBuffer(req.file.buffer, 'portfolioos/avatars');
    const avatarPath = result.secure_url;
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { avatar: avatarPath } }, { new: true });
    if (existing?.avatar) await deleteByUrl(existing.avatar); // remove the old file now that it's replaced
    res.json({ message: 'Avatar uploaded', portfolio: user, avatar: avatarPath });
    await Activity.log(req.user._id, 'avatar_updated', 'Updated profile image');
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/portfolio/avatar  — remove the current profile image
router.delete('/avatar', protect, async (req, res) => {
  try {
    const existing = await User.findById(req.user._id);
    if (!existing?.avatar) return res.status(400).json({ message: 'No avatar to remove' });
    await deleteByUrl(existing.avatar);
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { avatar: '' } }, { new: true });
    res.json({ message: 'Avatar removed', portfolio: user });
    await Activity.log(req.user._id, 'avatar_updated', 'Removed profile image');
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
