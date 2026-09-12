const Note = require('../models/Note');
const { crudFactory } = require('../utils/crudFactory');

const base = crudFactory(Note, ['title', 'content', 'tags', 'category']);

module.exports = {
  list:           base.list,
  getOne:         base.getOne,
  create:         base.create,
  update:         base.update,
  remove:         base.remove,
  toggleFavorite: base.toggleFavorite,
};
