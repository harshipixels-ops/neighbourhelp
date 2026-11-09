const { getModels } = require('../config/db');

const ALLOWED_CATEGORIES = [
  'Grocery and Essentials',
  'Household Assistance',
  'Elderly Assistance',
  'Carrying and Moving',
  'Errands and Deliveries',
  'Other Everyday Assistance'
];

exports.createRequest = async (req, res) => {
  try {
    const { title, description, category, neighbourhood, preferredDate = '', additionalInstructions = '' } = req.body;

    if (!title || !description || !category || !neighbourhood) {
      return res.status(400).json({ message: 'Title, description, category, and neighbourhood are required.' });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category selected.' });
    }

    const { Request } = getModels();

    const newRequest = await Request.create({
      requesterId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      neighbourhood: neighbourhood.trim(),
      preferredDate: preferredDate.trim(),
      additionalInstructions: additionalInstructions.trim(),
      status: 'open',
      acceptedVolunteerId: null,
      coordinationMessages: []
    });

    return res.status(201).json({
      message: 'Help request posted successfully! Neighbours can now see your request.',
      request: newRequest
    });
  } catch (err) {
    console.error('createRequest error:', err);
    return res.status(500).json({ message: 'Failed to create help request.' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { category, neighbourhood, search, status } = req.query;
    const { Request, VolunteerOffer } = getModels();

    const filter = {};

    // Filter by status: default to active requests if not specified, or show requested status
    if (status) {
      filter.status = status;
    } else {
      // By default show open or pending in public browse
      filter.status = { $in: ['open', 'pending', 'accepted', 'in_progress', 'completed'] };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (neighbourhood && neighbourhood !== 'All') {
      filter.neighbourhood = { $regex: neighbourhood, $options: 'i' };
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { neighbourhood: { $regex: term, $options: 'i' } }
      ];
    }

    const requests = await Request.find(filter)
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name neighbourhood profileImage createdAt')
      .populate('acceptedVolunteerId', 'name neighbourhood profileImage');

    // Add offer counts for each request
    const allOffers = await VolunteerOffer.find({});
    const requestsWithMeta = requests.map(r => {
      const doc = r.toObject ? r.toObject() : { ...r };
      const offersForReq = allOffers.filter(o => o.requestId.toString() === doc._id.toString());
      doc.offerCount = offersForReq.length;
      doc.pendingOfferCount = offersForReq.filter(o => o.status === 'pending').length;

      // Privacy: if current user is not the requester and not accepted volunteer, don't expose additional private instructions
      const isOwner = req.user && req.user._id === (doc.requesterId._id || doc.requesterId).toString();
      const isAccepted = req.user && doc.acceptedVolunteerId && (doc.acceptedVolunteerId._id || doc.acceptedVolunteerId).toString() === req.user._id;

      if (!isOwner && !isAccepted) {
        delete doc.additionalInstructions;
        delete doc.coordinationMessages;
      }

      return doc;
    });

    return res.json({ requests: requestsWithMeta });
  } catch (err) {
    console.error('getRequests error:', err);
    return res.status(500).json({ message: 'Failed to retrieve requests.' });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Request, VolunteerOffer } = getModels();

    const request = await Request.findById(id)
      .populate('requesterId', 'name neighbourhood bio profileImage createdAt')
      .populate('acceptedVolunteerId', 'name neighbourhood bio profileImage');

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const doc = request.toObject ? request.toObject() : { ...request };
    const requesterIdStr = (doc.requesterId._id || doc.requesterId).toString();
    const isOwner = req.user && req.user._id === requesterIdStr;
    const isAccepted = req.user && doc.acceptedVolunteerId && (doc.acceptedVolunteerId._id || doc.acceptedVolunteerId).toString() === req.user._id;

    // Attach offers if owner
    if (isOwner) {
      const offers = await VolunteerOffer.find({ requestId: doc._id })
        .populate('volunteerId', 'name neighbourhood bio profileImage createdAt')
        .sort({ createdAt: -1 });
      doc.offers = offers;
    } else {
      // Check if current user has already submitted an offer
      if (req.user) {
        const myOffer = await VolunteerOffer.findOne({ requestId: doc._id, volunteerId: req.user._id });
        doc.myOffer = myOffer || null;
      }
      if (!isAccepted) {
        delete doc.additionalInstructions;
        delete doc.coordinationMessages;
      }
    }

    return res.json({ request: doc });
  } catch (err) {
    console.error('getRequestById error:', err);
    return res.status(500).json({ message: 'Error fetching request details.' });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, neighbourhood, preferredDate, additionalInstructions } = req.body;
    const { Request } = getModels();

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.requesterId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized. You can only edit your own requests.' });
    }

    if (!['open', 'pending'].includes(request.status)) {
      return res.status(400).json({ message: `Cannot edit request in '${request.status}' status.` });
    }

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (category) updates.category = category;
    if (neighbourhood) updates.neighbourhood = neighbourhood.trim();
    if (preferredDate !== undefined) updates.preferredDate = preferredDate.trim();
    if (additionalInstructions !== undefined) updates.additionalInstructions = additionalInstructions.trim();

    const updated = await Request.findByIdAndUpdate(id, updates, { new: true });

    return res.json({
      message: 'Request updated successfully!',
      request: updated
    });
  } catch (err) {
    console.error('updateRequest error:', err);
    return res.status(500).json({ message: 'Failed to update request.' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { Request, VolunteerOffer, Notification } = getModels();

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.requesterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only requester or admin can cancel.' });
    }

    if (['completed', 'cancelled'].includes(request.status)) {
      return res.status(400).json({ message: `Request is already ${request.status}.` });
    }

    request.status = 'cancelled';
    await request.save();

    // Notify any volunteers who offered
    const offers = await VolunteerOffer.find({ requestId: id });
    for (const offer of offers) {
      if (offer.status !== 'rejected') {
        await Notification.create({
          recipientId: offer.volunteerId,
          type: 'request_cancelled',
          message: `The request "${request.title}" you offered to help with has been cancelled by the requester.`,
          relatedRequestId: request._id
        });
      }
    }

    return res.json({
      message: 'Request cancelled successfully.',
      request
    });
  } catch (err) {
    console.error('cancelRequest error:', err);
    return res.status(500).json({ message: 'Failed to cancel request.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { Request, Notification } = getModels();

    const validStatuses = ['in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid target status.' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const isRequester = request.requesterId.toString() === req.user._id;
    const isVolunteer = request.acceptedVolunteerId && request.acceptedVolunteerId.toString() === req.user._id;

    if (!isRequester && !isVolunteer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this request status.' });
    }

    // Status transition rules
    if (status === 'in_progress') {
      if (request.status !== 'accepted') {
        return res.status(400).json({ message: 'Assistance can only be started when a volunteer is accepted.' });
      }
      request.status = 'in_progress';
      await request.save();

      // Notify the other party
      const notifyTarget = isRequester ? request.acceptedVolunteerId : request.requesterId;
      if (notifyTarget) {
        await Notification.create({
          recipientId: notifyTarget,
          type: 'status_updated',
          message: `Assistance for "${request.title}" is now marked as In Progress.`,
          relatedRequestId: request._id
        });
      }
    } else if (status === 'completed') {
      if (!['accepted', 'in_progress'].includes(request.status)) {
        return res.status(400).json({ message: 'Cannot mark as completed from current status.' });
      }
      request.status = 'completed';
      await request.save();

      // Notify other party
      const notifyTarget = isRequester ? request.acceptedVolunteerId : request.requesterId;
      if (notifyTarget) {
        await Notification.create({
          recipientId: notifyTarget,
          type: 'request_completed',
          message: `The assistance request "${request.title}" has been marked as Completed! Thank you for strengthening our neighbourhood.`,
          relatedRequestId: request._id
        });
      }
    }

    return res.json({
      message: `Request status updated to ${request.status}.`,
      request
    });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ message: 'Failed to update request status.' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const { Request, VolunteerOffer } = getModels();

    const requests = await Request.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('acceptedVolunteerId', 'name neighbourhood bio profileImage');

    const allOffers = await VolunteerOffer.find({});

    const enriched = requests.map(r => {
      const doc = r.toObject ? r.toObject() : { ...r };
      const offers = allOffers.filter(o => o.requestId.toString() === doc._id.toString());
      doc.offersCount = offers.length;
      doc.pendingOffersCount = offers.filter(o => o.status === 'pending').length;
      return doc;
    });

    return res.json({ requests: enriched });
  } catch (err) {
    console.error('getMyRequests error:', err);
    return res.status(500).json({ message: 'Failed to retrieve your requests.' });
  }
};

// Coordination Message (Chat between Requester and Accepted Volunteer)
exports.addCoordinationMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const { Request, Notification } = getModels();

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const isRequester = request.requesterId.toString() === req.user._id;
    const isAccepted = request.acceptedVolunteerId && request.acceptedVolunteerId.toString() === req.user._id;

    if (!isRequester && !isAccepted && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the requester and accepted volunteer can exchange coordination notes.' });
    }

    const newMsg = {
      senderId: req.user._id,
      senderName: req.user.name,
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    if (!request.coordinationMessages) request.coordinationMessages = [];
    request.coordinationMessages.push(newMsg);
    await request.save();

    // Notify other party
    const notifyTarget = isRequester ? request.acceptedVolunteerId : request.requesterId;
    if (notifyTarget) {
      await Notification.create({
        recipientId: notifyTarget,
        type: 'coordination_message',
        message: `${req.user.name} sent a coordination note for "${request.title}": "${message.trim().slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
        relatedRequestId: request._id
      });
    }

    return res.status(201).json({
      message: 'Coordination message sent.',
      coordinationMessage: newMsg
    });
  } catch (err) {
    console.error('addCoordinationMessage error:', err);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
};

// Feedback & Gratitude Note
exports.submitCompletionFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating = 5, note = '' } = req.body;
    const { Request, Notification } = getModels();

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.requesterId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Only the requester can submit gratitude feedback.' });
    }

    request.completionFeedback = {
      rating: Math.max(1, Math.min(5, Number(rating))),
      note: note.trim(),
      createdAt: new Date().toISOString()
    };
    await request.save();

    if (request.acceptedVolunteerId) {
      await Notification.create({
        recipientId: request.acceptedVolunteerId,
        type: 'feedback_received',
        message: `${req.user.name} gave you a ${rating}★ rating and heartfelt gratitude for "${request.title}"!`,
        relatedRequestId: request._id
      });
    }

    return res.json({
      message: 'Thank you for your feedback! Community recognition has been recorded for the volunteer.',
      completionFeedback: request.completionFeedback
    });
  } catch (err) {
    console.error('submitCompletionFeedback error:', err);
    return res.status(500).json({ message: 'Failed to submit feedback.' });
  }
};
