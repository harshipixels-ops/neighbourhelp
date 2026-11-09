const { getModels } = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const { Notification } = getModels();

    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { Notification } = getModels();

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notif.recipientId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    notif.isRead = true;
    await notif.save();

    return res.json({ message: 'Marked as read.', notification: notif });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ message: 'Failed to update notification.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { Notification } = getModels();
    const notifications = await Notification.find({ recipientId: req.user._id, isRead: false });

    for (const notif of notifications) {
      notif.isRead = true;
      await notif.save();
    }

    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ message: 'Failed to update notifications.' });
  }
};

