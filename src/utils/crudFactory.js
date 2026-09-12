/**
 * Generic CRUD factory.
 * Creates standard list / getOne / create / update / delete / toggleFavorite
 * handlers for a given Mongoose model, scoped to req.user._id.
 */

/**
 * Build a $or search query across text fields.
 */
const buildSearch = (q, fields) => {
  if (!q) return {};
  const regex = new RegExp(q, 'i');
  return { $or: fields.map(f => ({ [f]: regex })) };
};

/**
 * Factory: returns a controller object for a resource model.
 * @param {mongoose.Model} Model
 * @param {string[]} searchFields  — fields to include in text search
 * @param {object}  opts
 *   opts.uploadFields: { fileUrl, filePublicId } — field names for file metadata
 */
const crudFactory = (Model, searchFields = ['title', 'description'], opts = {}) => {
  const fileUrlField      = opts?.uploadFields?.fileUrl      || 'fileUrl';
  const filePublicIdField = opts?.uploadFields?.filePublicId || 'filePublicId';

  const list = async (req, res, next) => {
    try {
      const { q, isFavorited } = req.query;
      const filter = { user: req.user._id, ...buildSearch(q, searchFields) };
      if (isFavorited === 'true') filter.isFavorited = true;
      const docs = await Model.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, data: docs });
    } catch (err) { next(err); }
  };

  const getOne = async (req, res, next) => {
    try {
      const doc = await Model.findOne({ _id: req.params.id, user: req.user._id });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  };

  const create = async (req, res, next) => {
    try {
      const doc = await Model.create({ ...req.body, user: req.user._id });
      res.status(201).json({ success: true, data: doc });
    } catch (err) { next(err); }
  };

  const update = async (req, res, next) => {
    try {
      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  };

  const remove = async (req, res, next) => {
    try {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, message: 'Deleted successfully.' });
    } catch (err) { next(err); }
  };

  const toggleFavorite = async (req, res, next) => {
    try {
      const doc = await Model.findOne({ _id: req.params.id, user: req.user._id });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      doc.isFavorited = !doc.isFavorited;
      await doc.save();
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  };

  return { list, getOne, create, update, remove, toggleFavorite };
};

module.exports = { crudFactory, buildSearch };
