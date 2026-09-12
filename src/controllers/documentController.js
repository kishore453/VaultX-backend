const Document = require('../models/Document');
const { crudFactory } = require('../utils/crudFactory');
const { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_CONFIGURED } = require('../middleware/upload');

const base = crudFactory(Document, ['title', 'description', 'category', 'tags']);

// Override create to handle file upload
const create = async (req, res, next) => {
  try {
    const fields = { ...req.body, user: req.user._id };
    if (req.file) {
      if (!CLOUDINARY_CONFIGURED) {
        return res.status(503).json({
          success: false,
          message: 'File upload unavailable. Configure Cloudinary in backend/.env',
        });
      }
      const { url, publicId } = await uploadToCloudinary(
        req.file.buffer,
        `vaultx/${req.user._id}/documents`
      );
      fields.fileUrl      = url;
      fields.filePublicId = publicId;
      fields.fileName     = req.file.originalname;
      fields.fileSize     = req.file.size;
      fields.mimeType     = req.file.mimetype;
    }
    const doc = await Document.create(fields);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Override remove to also delete from Cloudinary
const remove = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    await deleteFromCloudinary(doc.filePublicId);
    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) { next(err); }
};

module.exports = {
  list: base.list,
  getOne: base.getOne,
  create,
  update: base.update,
  remove,
  toggleFavorite: base.toggleFavorite,
};
