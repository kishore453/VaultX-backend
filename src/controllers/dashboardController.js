const Document    = require('../models/Document');
const Certificate = require('../models/Certificate');
const Link        = require('../models/Link');
const Project     = require('../models/Project');
const Internship  = require('../models/Internship');
const Achievement = require('../models/Achievement');
const Note        = require('../models/Note');

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const [documents, certificates, projects, links, notes, achievements] = await Promise.all([
      Document.countDocuments({ user: uid }),
      Certificate.countDocuments({ user: uid }),
      Project.countDocuments({ user: uid }),
      Link.countDocuments({ user: uid }),
      Note.countDocuments({ user: uid }),
      Achievement.countDocuments({ user: uid }),
    ]);
    res.json({ success: true, data: { documents, certificates, projects, links, notes, achievements } });
  } catch (err) { next(err); }
};

// GET /api/dashboard/recent — last 10 items across all sections
const getRecent = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const limit = 5;
    const [docs, certs, links, projects, notes, achievements, internships] = await Promise.all([
      Document.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
      Certificate.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
      Link.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
      Project.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
      Note.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
      Achievement.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
      Internship.find({ user: uid }).sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    const tagged = [
      ...docs.map(d => ({ ...d, _type: 'document', _label: d.title })),
      ...certs.map(d => ({ ...d, _type: 'certificate', _label: d.name })),
      ...links.map(d => ({ ...d, _type: 'link', _label: d.title })),
      ...projects.map(d => ({ ...d, _type: 'project', _label: d.name })),
      ...notes.map(d => ({ ...d, _type: 'note', _label: d.title })),
      ...achievements.map(d => ({ ...d, _type: 'achievement', _label: d.title })),
      ...internships.map(d => ({ ...d, _type: 'internship', _label: d.company })),
    ];

    tagged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: tagged.slice(0, 10) });
  } catch (err) { next(err); }
};

// GET /api/dashboard/favorites — all favorited items across all sections
const getFavorites = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const filter = { user: uid, isFavorited: true };
    const [docs, certs, links, projects, notes, achievements, internships] = await Promise.all([
      Document.find(filter).lean(),
      Certificate.find(filter).lean(),
      Link.find(filter).lean(),
      Project.find(filter).lean(),
      Note.find(filter).lean(),
      Achievement.find(filter).lean(),
      Internship.find(filter).lean(),
    ]);
    res.json({
      success: true,
      data: {
        documents:    docs.map(d => ({ ...d, _type: 'document' })),
        certificates: certs.map(d => ({ ...d, _type: 'certificate' })),
        links:        links.map(d => ({ ...d, _type: 'link' })),
        projects:     projects.map(d => ({ ...d, _type: 'project' })),
        notes:        notes.map(d => ({ ...d, _type: 'note' })),
        achievements: achievements.map(d => ({ ...d, _type: 'achievement' })),
        internships:  internships.map(d => ({ ...d, _type: 'internship' })),
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getStats, getRecent, getFavorites };
