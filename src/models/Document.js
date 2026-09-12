const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, trim: true, maxlength: [1000, 'Description too long'] },
    category: {
      type: String,
      enum: ['resume', 'certificate', 'id', 'academic', 'financial', 'medical', 'legal', 'other'],
      default: 'other',
    },
    tags: [{ type: String, trim: true }],
    // File info (populated after Cloudinary upload)
    fileUrl:       { type: String, default: '' },
    filePublicId:  { type: String, default: '' },
    fileName:      { type: String, default: '' },
    fileSize:      { type: Number, default: 0 },
    mimeType:      { type: String, default: '' },
    isFavorited:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
