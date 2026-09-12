const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { parseUpload } = require('../middleware/upload');
const ctrl = require('../controllers/achievementController');

router.use(protect);
router.route('/').get(ctrl.list).post(parseUpload, ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);
router.patch('/:id/favorite', ctrl.toggleFavorite);
module.exports = router;
