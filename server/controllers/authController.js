const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getModels } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password, neighbourhood, bio = '', profileImage = '' } = req.body;

    if (!name || !email || !password || !neighbourhood) {
      return res.status(400).json({ message: 'Full name, email, password, and neighbourhood are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const { User } = getModels();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      neighbourhood: neighbourhood.trim(),
      bio: bio.trim(),
      profileImage: profileImage.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      role: 'user',
      status: 'active'
    });

    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        neighbourhood: newUser.neighbourhood,
        bio: newUser.bio,
        profileImage: newUser.profileImage,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { User } = getModels();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended by an administrator.' });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Welcome back!',
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        neighbourhood: user.neighbourhood,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { User, Request, VolunteerOffer } = getModels();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const requestsCreatedCount = await Request.countDocuments({ requesterId: user._id });
    const requestsCompletedCount = await Request.countDocuments({ requesterId: user._id, status: 'completed' });
    const offersMadeCount = await VolunteerOffer.countDocuments({ volunteerId: user._id });
    const offersAcceptedCount = await VolunteerOffer.countDocuments({ volunteerId: user._id, status: 'accepted' });

    return res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        neighbourhood: user.neighbourhood,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      },
      stats: {
        requestsCreatedCount,
        requestsCompletedCount,
        offersMadeCount,
        offersAcceptedCount
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Server error retrieving user data.' });
  }
};

