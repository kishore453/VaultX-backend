const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:       { type: String, required: [true, 'Link title is required'], trim: true, maxlength: 200 },
    url:         { type: String, required: [true, 'URL is required'], trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    category:    {
      type: String,
      enum: ['portfolio', 'social', 'resource', 'project', 'article', 'tool', 'other'],
      default: 'other',
    },
    tags:        [{ type: String, trim: true }],
    isFavorited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Link', linkSchema);
