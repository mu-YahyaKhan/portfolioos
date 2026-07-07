const multer = require('multer');

// Vercel's serverless functions have a read-only, ephemeral filesystem, so we
// can't save files to disk (they'd disappear immediately). Instead we keep the
// upload in memory as a buffer and hand it to Cloudinary (see utils/cloudinary.js).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only jpg / png / webp images allowed'), false);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
