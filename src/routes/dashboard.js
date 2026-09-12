const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.use(protect);
router.get('/stats',     ctrl.getStats);
router.get('/recent',    ctrl.getRecent);
router.get('/favorites', ctrl.getFavorites);

module.exports = router;
