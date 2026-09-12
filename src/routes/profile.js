const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { parseUpload } = require('../middleware/upload');
const ctrl = require('../controllers/profileController');

router.use(protect);
router.get('/',  ctrl.getProfile);
router.put('/', parseUpload, ctrl.updateProfile);

module.exports = router;
