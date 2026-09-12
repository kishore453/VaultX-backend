const User = require('../models/User');
const { signToken } = require('../utils/jwt');

// ── Helper: send token response ────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// ── POST /api/auth/register ────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    // 2. Password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    // 3. Passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // 4. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 5. Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 6. Create user (password hashed by pre-save hook in model)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ───────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // 2. Find user with password field (select: false on schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ───────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user set by protect middleware (no password)
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ──────────────────────────────
const logout = async (req, res) => {
  // JWT is stateless — client discards the token.
  // We simply confirm logout server-side.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// ── PUT /api/auth/settings ─────────────────────────────
const updateSettings = async (req, res, next) => {
  try {
    const { emailNotifications } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (typeof emailNotifications === 'boolean') {
      user.emailNotifications = emailNotifications;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/change-password ──────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/auth/account ───────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body || {};

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password. Account was not deleted.',
        });
      }
    }

    const userId = req.user._id;

    // Delete user and all associated resources
    const Profile = require('../models/Profile');
    const Project = require('../models/Project');
    const Note = require('../models/Note');
    const Link = require('../models/Link');
    const Internship = require('../models/Internship');
    const Document = require('../models/Document');
    const Certificate = require('../models/Certificate');
    const Achievement = require('../models/Achievement');

    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.deleteMany({ user: userId }),
      Project.deleteMany({ user: userId }),
      Note.deleteMany({ user: userId }),
      Link.deleteMany({ user: userId }),
      Internship.deleteMany({ user: userId }),
      Document.deleteMany({ user: userId }),
      Certificate.deleteMany({ user: userId }),
      Achievement.deleteMany({ user: userId }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data permanently deleted.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateSettings,
  changePassword,
  deleteAccount,
};
