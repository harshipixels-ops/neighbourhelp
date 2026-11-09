const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { authenticate } = require('../middleware/auth');

// My volunteer commitments
router.get('/my', authenticate, offerController.getMyOffers);

// Actions on individual offers
router.put('/:id/accept', authenticate, offerController.acceptOffer);
router.put('/:id/reject', authenticate, offerController.rejectOffer);
router.put('/:id/withdraw', authenticate, offerController.withdrawOffer);

module.exports = router;

