const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAnnouncements)
    .post(protect, authorize('clubAdmin'), createAnnouncement);

module.exports = router;
