const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:         { type: String, required: [true, 'Project name is required'], trim: true, maxlength: 200 },
    description:  { type: String, trim: true, maxlength: 2000 },
    technologies: [{ type: String, trim: true }],
    githubUrl:    { type: String, trim: true },
    liveUrl:      { type: String, trim: true },
    startDate:    { type: Date },
    endDate:      { type: Date },
    imageUrl:     { type: String, default: '' },
    imagePublicId:{ type: String, default: '' },
    isFavorited:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
