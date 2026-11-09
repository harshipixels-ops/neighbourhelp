const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/requests', adminController.getRequests);
router.delete('/requests/:id', adminController.deleteOrModerateRequest);
router.put('/requests/:id/moderate', adminController.deleteOrModerateRequest);
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.updateReport);

module.exports = router;

