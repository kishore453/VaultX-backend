const Achievement = require('../models/Achievement');
const { crudFactory } = require('../utils/crudFactory');
const { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_CONFIGURED } = require('../middleware/upload');

const base = crudFactory(Achievement, ['title', 'description', 'organization']);

const create = async (req, res, next) => {
  try {
    const fields = { ...req.body, user: req.user._id };
    if (req.file) {
      if (!CLOUDINARY_CONFIGURED) return res.status(503).json({ success: false, message: 'File upload unavailable.' });
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, `vaultx/${req.user._id}/achievements`);
      fields.fileUrl      = url;
      fields.filePublicId = publicId;
    }
    const doc = await Achievement.create(fields);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const doc = await Achievement.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    await deleteFromCloudinary(doc.filePublicId);
    res.json({ success: true, message: 'Achievement deleted.' });
  } catch (err) { next(err); }
};

module.exports = { list: base.list, getOne: base.getOne, create, update: base.update, remove, toggleFavorite: base.toggleFavorite };
