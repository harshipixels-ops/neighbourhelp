const jwt = require('jsonwebtoken');
const { getModels } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'neighbourhelp_super_secure_jwt_secret_key_2026');
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { User } = getModels();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      neighbourhood: user.neighbourhood,
      role: user.role,
      status: user.status
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const { User } = getModels();
      const user = await User.findById(decoded.userId);
      if (user && user.status === 'active') {
        req.user = {
          _id: user._id.toString(),
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          neighbourhood: user.neighbourhood,
          role: user.role
        };
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};

