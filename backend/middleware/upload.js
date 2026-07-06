const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'image' ? 'project' : 'avatar';
    cb(null, `${prefix}-${req.user._id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg','image/jpg','image/png','image/webp'].includes(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only jpg / png / webp images allowed'), false);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
