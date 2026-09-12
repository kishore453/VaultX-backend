const Project = require('../models/Project');
const { crudFactory } = require('../utils/crudFactory');
const { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_CONFIGURED } = require('../middleware/upload');

const base = crudFactory(Project, ['name', 'description', 'technologies']);

const create = async (req, res, next) => {
  try {
    const fields = { ...req.body, user: req.user._id };
    // Parse technologies if sent as JSON string
    if (typeof fields.technologies === 'string') {
      try { fields.technologies = JSON.parse(fields.technologies); } catch { fields.technologies = [fields.technologies]; }
    }
    if (req.file) {
      if (!CLOUDINARY_CONFIGURED) return res.status(503).json({ success: false, message: 'File upload unavailable.' });
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, `vaultx/${req.user._id}/projects`, 'image');
      fields.imageUrl      = url;
      fields.imagePublicId = publicId;
    }
    const doc = await Project.create(fields);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (typeof body.technologies === 'string') {
      try { body.technologies = JSON.parse(body.technologies); } catch { body.technologies = [body.technologies]; }
    }
    const doc = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const doc = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    await deleteFromCloudinary(doc.imagePublicId);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) { next(err); }
};

module.exports = { list: base.list, getOne: base.getOne, create, update, remove, toggleFavorite: base.toggleFavorite };
