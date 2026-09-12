const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * protect middleware
 * Requires a valid Bearer JWT in the Authorization header.
 * Attaches req.user (safe fields, no password) on success.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please sign in to continue.',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Find user (exclude password explicitly)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please sign in again.',
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    // JWT errors are handled by errorHandler but return 401 explicitly here
    return res.status(401).json({
      success: false,
      message:
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please sign in again.'
          : 'Invalid token. Please sign in again.',
    });
  }
};

module.exports = { protect };
