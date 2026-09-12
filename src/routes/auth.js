const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updateSettings,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Protected routes
router.get('/me',              protect, getMe);
router.post('/logout',         protect, logout);
router.put('/settings',        protect, updateSettings);
router.put('/change-password', protect, changePassword);
router.delete('/account',      protect, deleteAccount);

module.exports = router;
