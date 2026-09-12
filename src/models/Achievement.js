const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:        { type: String, required: [true, 'Achievement title is required'], trim: true, maxlength: 200 },
    description:  { type: String, trim: true, maxlength: 2000 },
    date:         { type: Date },
    organization: { type: String, trim: true, maxlength: 200 },
    fileUrl:      { type: String, default: '' },
    filePublicId: { type: String, default: '' },
    isFavorited:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
