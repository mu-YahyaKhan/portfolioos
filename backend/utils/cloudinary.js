const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a buffer (e.g. req.file.buffer from multer's memoryStorage) to
// Cloudinary and resolves with the permanent, publicly-accessible URL.
function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Deletes a previously-uploaded image given its stored Cloudinary URL, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/v169.../portfolioos/avatars/abc123.jpg
// The public_id Cloudinary needs is "portfolioos/avatars/abc123" (folder + filename,
// no extension, no version segment). Non-Cloudinary URLs are ignored safely.
async function deleteByUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return;
  try {
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return;
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    // Non-fatal: the DB record is still cleared even if the remote file
    // couldn't be removed (e.g. already deleted, or a bad URL).
    console.error('Cloudinary delete failed:', err.message);
  }
}

module.exports = { cloudinary, uploadBuffer, deleteByUrl };
