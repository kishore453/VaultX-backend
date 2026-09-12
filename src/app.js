const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes       = require('./routes/health');
const authRoutes         = require('./routes/auth');
const documentRoutes     = require('./routes/documents');
const certificateRoutes  = require('./routes/certificates');
const linkRoutes         = require('./routes/links');
const projectRoutes      = require('./routes/projects');
const internshipRoutes   = require('./routes/internships');
const achievementRoutes  = require('./routes/achievements');
const noteRoutes         = require('./routes/notes');
const profileRoutes      = require('./routes/profile');
const dashboardRoutes    = require('./routes/dashboard');

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Routes ─────────────────────────────────────────────
app.use('/api/health',       healthRoutes);
app.use('/api/auth',         authRoutes);
app.use('/api/documents',    documentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/links',        linkRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/internships',  internshipRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notes',        noteRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
