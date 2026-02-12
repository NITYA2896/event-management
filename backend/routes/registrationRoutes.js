const express = require('express');
const router = express.Router();
const {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations,
    getEventRegistrations,
    exportRegistrations
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), registerForEvent);
router.put('/cancel/:id', protect, authorize('student'), cancelRegistration);
router.get('/my', protect, authorize('student'), getMyRegistrations);
router.get('/event/:eventId', protect, authorize('clubAdmin'), getEventRegistrations);
router.get('/export/:eventId', protect, authorize('clubAdmin'), exportRegistrations);

module.exports = router;
