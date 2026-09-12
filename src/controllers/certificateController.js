const Certificate = require('../models/Certificate');
const { crudFactory } = require('../utils/crudFactory');
const { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_CONFIGURED } = require('../middleware/upload');

const base = crudFactory(Certificate, ['name', 'issuingOrg', 'description', 'credentialId']);

const create = async (req, res, next) => {
  try {
    const fields = { ...req.body, user: req.user._id };
    if (req.file) {
      if (!CLOUDINARY_CONFIGURED) {
        return res.status(503).json({ success: false, message: 'File upload unavailable. Configure Cloudinary.' });
      }
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, `vaultx/${req.user._id}/certificates`);
      fields.fileUrl      = url;
      fields.filePublicId = publicId;
    }
    const doc = await Certificate.create(fields);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const doc = await Certificate.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    await deleteFromCloudinary(doc.filePublicId);
    res.json({ success: true, message: 'Certificate deleted.' });
  } catch (err) { next(err); }
};

module.exports = { list: base.list, getOne: base.getOne, create, update: base.update, remove, toggleFavorite: base.toggleFavorite };
