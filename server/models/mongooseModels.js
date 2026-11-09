const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  profileImage: { type: String, default: '' },
  neighbourhood: { type: String, required: true, trim: true },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const coordinationMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, default: 5 },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const requestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Grocery and Essentials',
      'Household Assistance',
      'Elderly Assistance',
      'Carrying and Moving',
      'Errands and Deliveries',
      'Other Everyday Assistance'
    ]
  },
  neighbourhood: { type: String, required: true, trim: true },
  preferredDate: { type: String, default: '' },
  additionalInstructions: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  acceptedVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  coordinationMessages: [coordinationMessageSchema],
  completionFeedback: feedbackSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const volunteerOfferSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'offer_received',
      'offer_accepted',
      'offer_rejected',
      'status_updated',
      'request_completed',
      'request_cancelled',
      'report_update',
      'coordination_message',
      'feedback_received'
    ]
  },
  message: { type: String, required: true },
  relatedRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['request', 'user'], required: true },
  targetId: { type: String, required: true },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
const VolunteerOffer = mongoose.models.VolunteerOffer || mongoose.model('VolunteerOffer', volunteerOfferSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

module.exports = {
  User,
  Request,
  VolunteerOffer,
  Notification,
  Report
};
