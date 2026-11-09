const { getModels } = require('../config/db');

exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details = '' } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'Target type, target ID, and reason are required.' });
    }

    if (!['request', 'user'].includes(targetType)) {
      return res.status(400).json({ message: 'Target type must be "request" or "user".' });
    }

    const { Report, Request, User } = getModels();

    if (targetType === 'request') {
      const exists = await Request.findById(targetId);
      if (!exists) return res.status(404).json({ message: 'Request not found.' });
    } else if (targetType === 'user') {
      const exists = await User.findById(targetId);
      if (!exists) return res.status(404).json({ message: 'User not found.' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason: reason.trim(),
      details: details.trim(),
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Thank you for helping keep NeighbourHelp safe. Administrators have received your report.',
      report
    });
  } catch (err) {
    console.error('createReport error:', err);
    return res.status(500).json({ message: 'Failed to submit report.' });
  }
};

