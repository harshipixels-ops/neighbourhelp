const { getModels } = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const { User, Request, VolunteerOffer, Report } = getModels();

    const users = await User.find({});
    const requests = await Request.find({});
    const offers = await VolunteerOffer.find({});
    const reports = await Report.find({});

    const stats = {
      users: {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length
      },
      requests: {
        total: requests.length,
        open: requests.filter(r => r.status === 'open').length,
        pending: requests.filter(r => r.status === 'pending').length,
        accepted: requests.filter(r => r.status === 'accepted').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
        cancelled: requests.filter(r => r.status === 'cancelled').length
      },
      offers: {
        total: offers.length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        pending: offers.filter(o => o.status === 'pending').length
      },
      reports: {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        resolved: reports.filter(r => ['resolved', 'dismissed'].includes(r.status)).length
      }
    };

    // Recent activity log (latest requests & reports)
    const recentRequests = requests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(r => ({
        type: 'request',
        id: r._id,
        title: r.title,
        status: r.status,
        neighbourhood: r.neighbourhood,
        createdAt: r.createdAt
      }));

    const recentReports = reports
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(rep => ({
        type: 'report',
        id: rep._id,
        reason: rep.reason,
        status: rep.status,
        createdAt: rep.createdAt
      }));

    return res.json({
      stats,
      recentActivity: [...recentRequests, ...recentReports].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ message: 'Failed to load administrator dashboard.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const { User, Request, VolunteerOffer } = getModels();

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { neighbourhood: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const allRequests = await Request.find({});
    const allOffers = await VolunteerOffer.find({});

    const enriched = users.map(u => {
      const doc = u.toObject ? u.toObject() : { ...u };
      delete doc.passwordHash;
      doc.requestsCount = allRequests.filter(r => r.requesterId.toString() === doc._id.toString()).length;
      doc.offersCount = allOffers.filter(o => o.volunteerId.toString() === doc._id.toString()).length;
      return doc;
    });

    return res.json({ users: enriched });
  } catch (err) {
    console.error('admin getUsers error:', err);
    return res.status(500).json({ message: 'Failed to load users.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { User } = getModels();

    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin' && status !== 'active') {
      return res.status(400).json({ message: 'Cannot deactivate or suspend an admin account.' });
    }

    user.status = status;
    await user.save();

    return res.json({
      message: `User status changed to ${status}.`,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    return res.status(500).json({ message: 'Failed to update user status.' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { Request } = getModels();

    const requests = await Request.find({})
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name email neighbourhood')
      .populate('acceptedVolunteerId', 'name email neighbourhood');

    return res.json({ requests });
  } catch (err) {
    console.error('admin getRequests error:', err);
    return res.status(500).json({ message: 'Failed to load requests.' });
  }
};

exports.deleteOrModerateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'cancel' or 'delete'
    const { Request, VolunteerOffer, Notification } = getModels();

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (action === 'delete') {
      await Request.findByIdAndDelete(id);
      await VolunteerOffer.deleteMany({ requestId: id });
      return res.json({ message: 'Request and related offers permanently deleted by admin.' });
    } else {
      request.status = 'cancelled';
      await request.save();

      await Notification.create({
        recipientId: request.requesterId,
        type: 'request_cancelled',
        message: `Your request "${request.title}" was cancelled by a platform moderator for policy compliance.`,
        relatedRequestId: request._id
      });

      return res.json({ message: 'Request cancelled by moderator.', request });
    }
  } catch (err) {
    console.error('deleteOrModerateRequest error:', err);
    return res.status(500).json({ message: 'Failed to moderate request.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { Report, User, Request } = getModels();

    const reports = await Report.find({}).sort({ createdAt: -1 });

    const enriched = [];
    for (const rep of reports) {
      const doc = rep.toObject ? rep.toObject() : { ...rep };
      const reporter = await User.findById(doc.reporterId);
      if (reporter) {
        doc.reporter = {
          _id: reporter._id,
          name: reporter.name,
          email: reporter.email
        };
      }

      if (doc.targetType === 'request') {
        const reqItem = await Request.findById(doc.targetId);
        doc.targetRequest = reqItem || null;
      } else if (doc.targetType === 'user') {
        const userItem = await User.findById(doc.targetId);
        if (userItem) {
          doc.targetUser = {
            _id: userItem._id,
            name: userItem.name,
            email: userItem.email,
            status: userItem.status
          };
        }
      }

      enriched.push(doc);
    }

    return res.json({ reports: enriched });
  } catch (err) {
    console.error('getReports error:', err);
    return res.status(500).json({ message: 'Failed to load reports.' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { Report } = getModels();

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid report status.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    await report.save();

    return res.json({ message: `Report marked as ${status}.`, report });
  } catch (err) {
    console.error('updateReport error:', err);
    return res.status(500).json({ message: 'Failed to update report.' });
  }
};

