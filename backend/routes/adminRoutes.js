const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analytics', protect, authorize('superAdmin'), getAdminAnalytics);

module.exports = router;
