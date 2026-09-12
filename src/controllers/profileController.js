const Profile = require('../models/Profile');
const User    = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_CONFIGURED } = require('../middleware/upload');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      // Auto-create empty profile on first access
      profile = await Profile.create({ user: req.user._id });
    }
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        name:      user.name,
        email:     user.email,
        avatar:    user.avatar,
        ...profile.toObject(),
      },
    });
  } catch (err) { next(err); }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, dob, location, bio, linkedin, github, portfolio, otherLinks } = req.body;

    // Update name on User model if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { runValidators: true });
    }

    // Handle avatar upload
    let avatarUpdate = {};
    if (req.file) {
      if (!CLOUDINARY_CONFIGURED) {
        return res.status(503).json({ success: false, message: 'File upload unavailable. Configure Cloudinary.' });
      }
      const existing = await Profile.findOne({ user: req.user._id });
      if (existing?.avatarPublicId) {
        await deleteFromCloudinary(existing.avatarPublicId);
      }
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, `vaultx/${req.user._id}/avatar`, 'image');
      avatarUpdate = { avatarUrl: url, avatarPublicId: publicId };
      // Also update User.avatar
      await User.findByIdAndUpdate(req.user._id, { avatar: url });
    }

    // Parse otherLinks if it's a JSON string
    let parsedOtherLinks = otherLinks;
    if (typeof otherLinks === 'string') {
      try { parsedOtherLinks = JSON.parse(otherLinks); } catch { parsedOtherLinks = []; }
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { phone, dob, location, bio, linkedin, github, portfolio, otherLinks: parsedOtherLinks, ...avatarUpdate } },
      { new: true, upsert: true, runValidators: true }
    );

    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: { name: user.name, email: user.email, avatar: user.avatar, ...profile.toObject() },
    });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile };
