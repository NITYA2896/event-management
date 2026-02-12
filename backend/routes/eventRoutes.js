const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getEvents)
    .post(protect, authorize('clubAdmin'), createEvent);

router.route('/:id')
    .get(getEventById)
    .put(protect, authorize('clubAdmin', 'superAdmin'), updateEvent)
    .delete(protect, authorize('clubAdmin', 'superAdmin'), deleteEvent);

module.exports = router;
