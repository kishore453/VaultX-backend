const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:         { type: String, required: [true, 'Certificate name is required'], trim: true, maxlength: 200 },
    issuingOrg:   { type: String, trim: true, maxlength: 200 },
    issueDate:    { type: Date },
    expiryDate:   { type: Date },
    credentialId: { type: String, trim: true },
    credentialUrl:{ type: String, trim: true },
    description:  { type: String, trim: true, maxlength: 1000 },
    // Optional file upload
    fileUrl:      { type: String, default: '' },
    filePublicId: { type: String, default: '' },
    isFavorited:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
