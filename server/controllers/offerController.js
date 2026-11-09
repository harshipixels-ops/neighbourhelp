const { getModels } = require('../config/db');

exports.createOffer = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { message = '' } = req.body;
    const { Request, VolunteerOffer, Notification } = getModels();

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.requesterId.toString() === req.user._id) {
      return res.status(400).json({ message: 'You cannot volunteer for your own request.' });
    }

    if (!['open', 'pending'].includes(request.status)) {
      return res.status(400).json({ message: `Cannot volunteer for a request that is currently '${request.status}'.` });
    }

    // Check duplicate
    const existingOffer = await VolunteerOffer.findOne({
      requestId: request._id,
      volunteerId: req.user._id
    });

    if (existingOffer && existingOffer.status !== 'withdrawn') {
      return res.status(400).json({ message: 'You have already submitted a volunteer offer for this request.' });
    }

    let offer;
    if (existingOffer && existingOffer.status === 'withdrawn') {
      existingOffer.status = 'pending';
      existingOffer.message = message.trim();
      existingOffer.updatedAt = new Date().toISOString();
      await existingOffer.save();
      offer = existingOffer;
    } else {
      offer = await VolunteerOffer.create({
        requestId: request._id,
        volunteerId: req.user._id,
        message: message.trim(),
        status: 'pending'
      });
    }

    // Update request to 'pending' if it was 'open'
    if (request.status === 'open') {
      request.status = 'pending';
      await request.save();
    }

    // Notify requester
    await Notification.create({
      recipientId: request.requesterId,
      type: 'offer_received',
      message: `${req.user.name} volunteered to help with your request: "${request.title}".`,
      relatedRequestId: request._id
    });

    return res.status(201).json({
      message: 'Thank you! Your volunteer offer has been submitted to the requester.',
      offer
    });
  } catch (err) {
    console.error('createOffer error:', err);
    return res.status(500).json({ message: 'Failed to submit volunteer offer.' });
  }
};

exports.getRequestOffers = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { Request, VolunteerOffer } = getModels();

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.requesterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view volunteer offers for this request.' });
    }

    const offers = await VolunteerOffer.find({ requestId })
      .sort({ createdAt: -1 })
      .populate('volunteerId', 'name neighbourhood bio profileImage createdAt');

    return res.json({ offers });
  } catch (err) {
    console.error('getRequestOffers error:', err);
    return res.status(500).json({ message: 'Failed to retrieve offers.' });
  }
};

exports.acceptOffer = async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const { Request, VolunteerOffer, Notification, User } = getModels();

    const offer = await VolunteerOffer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    const request = await Request.findById(offer.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Associated request not found.' });
    }

    if (request.requesterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only the requester can accept offers.' });
    }

    if (['accepted', 'in_progress', 'completed'].includes(request.status)) {
      return res.status(400).json({ message: 'This request already has an accepted volunteer.' });
    }

    // Accept this offer
    offer.status = 'accepted';
    await offer.save();

    // Assign volunteer to request and change status to accepted
    request.status = 'accepted';
    request.acceptedVolunteerId = offer.volunteerId;
    await request.save();

    // Reject other pending offers
    const otherOffers = await VolunteerOffer.find({
      requestId: request._id,
      _id: { $ne: offer._id },
      status: 'pending'
    });

    for (const other of otherOffers) {
      other.status = 'rejected';
      await other.save();
      await Notification.create({
        recipientId: other.volunteerId,
        type: 'offer_rejected',
        message: `Another neighbour was accepted for the request: "${request.title}". Thank you for your willingness to help!`,
        relatedRequestId: request._id
      });
    }

    // Notify the accepted volunteer
    const requester = await User.findById(request.requesterId);
    await Notification.create({
      recipientId: offer.volunteerId,
      type: 'offer_accepted',
      message: `Congratulations! ${requester ? requester.name : 'The requester'} accepted your volunteer offer for "${request.title}". You can now coordinate assistance!`,
      relatedRequestId: request._id
    });

    return res.json({
      message: 'Volunteer accepted successfully! You can now coordinate assistance together.',
      offer,
      request
    });
  } catch (err) {
    console.error('acceptOffer error:', err);
    return res.status(500).json({ message: 'Failed to accept volunteer offer.' });
  }
};

exports.rejectOffer = async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const { Request, VolunteerOffer, Notification } = getModels();

    const offer = await VolunteerOffer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    const request = await Request.findById(offer.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Associated request not found.' });
    }

    if (request.requesterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    offer.status = 'rejected';
    await offer.save();

    // Check if any other pending offers exist
    const pendingOffers = await VolunteerOffer.find({
      requestId: request._id,
      status: 'pending'
    });

    if (pendingOffers.length === 0 && request.status === 'pending') {
      request.status = 'open';
      await request.save();
    }

    // Notify volunteer
    await Notification.create({
      recipientId: offer.volunteerId,
      type: 'offer_rejected',
      message: `Your volunteer offer for "${request.title}" was not accepted at this time.`,
      relatedRequestId: request._id
    });

    return res.json({ message: 'Volunteer offer rejected.', offer });
  } catch (err) {
    console.error('rejectOffer error:', err);
    return res.status(500).json({ message: 'Failed to reject offer.' });
  }
};

exports.withdrawOffer = async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const { Request, VolunteerOffer, Notification } = getModels();

    const offer = await VolunteerOffer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    if (offer.volunteerId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const request = await Request.findById(offer.requestId);
    if (request && ['in_progress', 'completed'].includes(request.status) && offer.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot withdraw an offer once assistance is in progress or completed.' });
    }

    const wasAccepted = offer.status === 'accepted';
    offer.status = 'withdrawn';
    await offer.save();

    if (request) {
      if (wasAccepted) {
        request.status = 'open';
        request.acceptedVolunteerId = null;
        await request.save();

        // Notify requester
        await Notification.create({
          recipientId: request.requesterId,
          type: 'status_updated',
          message: `${req.user.name} withdrew their volunteer commitment for "${request.title}". The request is now open for new volunteers.`,
          relatedRequestId: request._id
        });
      } else {
        // If it was just a pending offer, check if any others are pending
        const otherPending = await VolunteerOffer.find({
          requestId: request._id,
          status: 'pending'
        });
        if (otherPending.length === 0 && request.status === 'pending') {
          request.status = 'open';
          await request.save();
        }
      }
    }

    return res.json({ message: 'Volunteer commitment successfully withdrawn.', offer });
  } catch (err) {
    console.error('withdrawOffer error:', err);
    return res.status(500).json({ message: 'Failed to withdraw offer.' });
  }
};

exports.getMyOffers = async (req, res) => {
  try {
    const { VolunteerOffer, Request } = getModels();

    const offers = await VolunteerOffer.find({ volunteerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('requestId');

    // Populate requester on the request
    const populated = [];
    for (const offer of offers) {
      const doc = offer.toObject ? offer.toObject() : { ...offer };
      if (doc.requestId) {
        const reqDoc = await Request.findById(doc.requestId._id || doc.requestId)
          .populate('requesterId', 'name neighbourhood profileImage');
        doc.request = reqDoc;
      }
      populated.push(doc);
    }

    return res.json({ offers: populated });
  } catch (err) {
    console.error('getMyOffers error:', err);
    return res.status(500).json({ message: 'Failed to retrieve your volunteering records.' });
  }
};

