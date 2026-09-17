/**
 * upload.js — Multer + direct Cloudinary v2 stream upload.
 *
 * multer-storage-cloudinary requires cloudinary v1; we have v2.
 * Instead we use multer memoryStorage and upload the buffer manually via
 * cloudinary.uploader.upload_stream().
 *
 * If Cloudinary is not configured, metadata CRUD still works but file
 * upload returns a clear 503.
 */

const multer  = require('multer');
const { cloudinary } = require('../config/cloudinary');

const CLOUDINARY_CONFIGURED =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'REPLACE_ME' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'REPLACE_ME' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'REPLACE_ME';

// Allowed file types
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

// Always parse into memory (we stream to Cloudinary ourselves)
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, DOC, DOCX, TXT, images.`));
    }
  },
});

/**
 * Upload a buffer to Cloudinary and return { url, publicId }.
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by publicId.
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !CLOUDINARY_CONFIGURED) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (_) {
    // Non-fatal
  }
};

/**
 * Middleware: parse multipart/form-data with optional file field "file".
 * Attaches req.file if a file was sent.
 * Does NOT upload to Cloudinary — call uploadToCloudinary() in the controller.
 */
const parseUpload = (req, res, next) => {
  memUpload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { parseUpload, uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_CONFIGURED };
