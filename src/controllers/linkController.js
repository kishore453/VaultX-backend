const Link = require('../models/Link');
const { crudFactory } = require('../utils/crudFactory');

const base = crudFactory(Link, ['title', 'url', 'description', 'category', 'tags']);

// URL validation helper
const isValidUrl = (str) => {
  try { new URL(str); return true; } catch { return false; }
};

const create = async (req, res, next) => {
  try {
    if (!isValidUrl(req.body.url)) {
      return res.status(400).json({ success: false, message: 'Invalid URL. Please include http:// or https://' });
    }
    const doc = await Link.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    if (req.body.url && !isValidUrl(req.body.url)) {
      return res.status(400).json({ success: false, message: 'Invalid URL.' });
    }
    const doc = await Link.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

module.exports = { list: base.list, getOne: base.getOne, create, update, remove: base.remove, toggleFavorite: base.toggleFavorite };
