const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phone:      { type: String, trim: true, maxlength: 20 },
    dob:        { type: Date },
    location:   { type: String, trim: true, maxlength: 200 },
    bio:        { type: String, trim: true, maxlength: 1000 },
    linkedin:   { type: String, trim: true },
    github:     { type: String, trim: true },
    portfolio:  { type: String, trim: true },
    otherLinks: [
      {
        label: { type: String, trim: true },
        url:   { type: String, trim: true },
      },
    ],
    avatarUrl:       { type: String, default: '' },
    avatarPublicId:  { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
