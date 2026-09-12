const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:       { type: String, required: [true, 'Note title is required'], trim: true, maxlength: 200 },
    content:     { type: String, trim: true, maxlength: 20000 },
    tags:        [{ type: String, trim: true }],
    category:    {
      type: String,
      enum: ['personal', 'work', 'study', 'ideas', 'meeting', 'other'],
      default: 'other',
    },
    isFavorited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
