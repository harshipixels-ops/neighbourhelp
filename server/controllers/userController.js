const { getModels } = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const { User, Request, VolunteerOffer } = getModels();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const createdRequests = await Request.find({ requesterId: user._id });
    const volunteerOffers = await VolunteerOffer.find({ volunteerId: user._id });

    const stats = {
      totalRequests: createdRequests.length,
      activeRequests: createdRequests.filter(r => ['open', 'pending', 'accepted', 'in_progress'].includes(r.status)).length,
      completedRequests: createdRequests.filter(r => r.status === 'completed').length,
      totalVolunteered: volunteerOffers.length,
      acceptedVolunteered: volunteerOffers.filter(o => o.status === 'accepted').length,
      completedVolunteerActs: volunteerOffers.filter(o => o.status === 'accepted').length // based on matching completed requests
    };

    return res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        neighbourhood: user.neighbourhood,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt
      },
      stats
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ message: 'Error retrieving profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, neighbourhood, bio, profileImage } = req.body;
    const { User } = getModels();

    const updates = {};
    if (name) updates.name = name.trim();
    if (neighbourhood) updates.neighbourhood = neighbourhood.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (profileImage !== undefined) updates.profileImage = profileImage.trim();

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        neighbourhood: updatedUser.neighbourhood,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Error updating profile.' });
  }
};

// Safe public profile for viewing another user: NO email, NO private phone, privacy preserved
exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { User, Request, VolunteerOffer } = getModels();

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const createdRequests = await Request.find({ requesterId: user._id });
    const volunteerOffers = await VolunteerOffer.find({ volunteerId: user._id });

    return res.json({
      publicUser: {
        _id: user._id.toString(),
        name: user.name,
        neighbourhood: user.neighbourhood,
        bio: user.bio,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        stats: {
          requestsCompleted: createdRequests.filter(r => r.status === 'completed').length,
          volunteerActsAccepted: volunteerOffers.filter(o => o.status === 'accepted').length
        }
      }
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    return res.status(500).json({ message: 'Error retrieving public user profile.' });
  }
};

