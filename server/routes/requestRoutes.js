const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const offerController = require('../controllers/offerController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { checkEmergencyContent } = require('../middleware/safety');

// Public or optionally personalized browse
router.get('/', optionalAuth, requestController.getRequests);

// My requests (requester view)
router.get('/my', authenticate, requestController.getMyRequests);

// Create request with emergency checking & authentication
router.post('/', authenticate, checkEmergencyContent, requestController.createRequest);

// Specific request details
router.get('/:id', optionalAuth, requestController.getRequestById);

// Edit request
router.put('/:id', authenticate, checkEmergencyContent, requestController.updateRequest);

// Cancel request
router.delete('/:id', authenticate, requestController.cancelRequest);

// Status transition (in_progress, completed, cancelled)
router.put('/:id/status', authenticate, requestController.updateStatus);

// Volunteer for a request
router.post('/:id/volunteer', authenticate, checkEmergencyContent, offerController.createOffer);

// View offers for a request
router.get('/:id/offers', authenticate, offerController.getRequestOffers);

// Coordination chat messages
router.post('/:id/messages', authenticate, requestController.addCoordinationMessage);

// Completion gratitude rating & feedback
router.post('/:id/feedback', authenticate, requestController.submitCompletionFeedback);

module.exports = router;
