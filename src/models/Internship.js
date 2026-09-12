const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company:     { type: String, required: [true, 'Company name is required'], trim: true, maxlength: 200 },
    role:        { type: String, trim: true, maxlength: 200 },
    location:    { type: String, trim: true, maxlength: 200 },
    startDate:   { type: Date },
    endDate:     { type: Date },
    description: { type: String, trim: true, maxlength: 2000 },
    fileUrl:     { type: String, default: '' },
    filePublicId:{ type: String, default: '' },
    isFavorited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);
