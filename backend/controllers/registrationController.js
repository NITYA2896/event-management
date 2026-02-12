const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Student)
const registerForEvent = async (req, res) => {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if registration is required
    if (!event.isRegistrationRequired) {
        res.status(400);
        throw new Error('Registration is not required for this event');
    }

    // Check if registration is closed (deadline passed)
    if (new Date() > new Date(event.registrationDeadline)) {
        res.status(400);
        throw new Error('Registration deadline has passed');
    }

    // Check capacity
    const registrationCount = await Registration.countDocuments({ eventId, status: 'registered' });
    if (registrationCount >= event.maxParticipants) {
        res.status(400);
        throw new Error('Event is full');
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
        eventId,
        userId: req.user._id,
        status: 'registered'
    });

    if (existingRegistration) {
        res.status(400);
        throw new Error('You are already registered for this event');
    }

    const registration = await Registration.create({
        eventId,
        userId: req.user._id,
        teamMembers: req.body.teamMembers || []
    });

    if (registration) {
        // Add event to user's savedEvents (optional, or separate logic)
        // Here we just return success
        res.status(201).json(registration);
    } else {
        res.status(400);
        throw new Error('Invalid registration data');
    }
};

// @desc    Cancel registration
// @route   PUT /api/registrations/cancel/:id
// @access  Private (Student)
const cancelRegistration = async (req, res) => {
    const registration = await Registration.findById(req.params.id).populate('eventId');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    // Check if user owns the registration
    if (registration.userId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to cancel this registration');
    }

    // Check if event deadline passed
    if (new Date() > new Date(registration.eventId.registrationDeadline)) {
        res.status(400);
        throw new Error('Cannot cancel registration after deadline');
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ message: 'Registration cancelled' });
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Private (Student)
const getMyRegistrations = async (req, res) => {
    const registrations = await Registration.find({ userId: req.user._id })
        .populate('eventId', 'title eventDate status')
        .sort('-registeredAt');

    res.json(registrations);
};

// @desc    Get event registrations (for Club Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Club Admin)
const getEventRegistrations = async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check authorization
    if (req.user.role !== 'clubAdmin' || req.user.clubId.toString() !== event.clubId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these registrations');
    }

    const registrations = await Registration.find({ eventId: req.params.eventId })
        .populate('userId', 'name email')
        .sort('-registeredAt');

    res.json(registrations);
};

// @desc    Export registrations as CSV
// @route   GET /api/registrations/export/:eventId
// @access  Private (Club Admin)
const exportRegistrations = async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (req.user.role !== 'clubAdmin' || req.user.clubId.toString() !== event.clubId.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const registrations = await Registration.find({ eventId: req.params.eventId, status: 'registered' })
        .populate('userId', 'name email');

    let csv = 'Team Lead Name,Team Lead Email,Registration Date,Team Members\n';

    registrations.forEach(reg => {
        const teamMembersStr = reg.teamMembers && reg.teamMembers.length > 0
            ? reg.teamMembers.map(m => `${m.name} (${m.email})`).join('; ')
            : 'N/A';

        csv += `${reg.userId.name},${reg.userId.email},${new Date(reg.registeredAt).toLocaleString()},"${teamMembersStr}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`registrations-${event.title}.csv`);
    return res.send(csv);
};

module.exports = {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations,
    getEventRegistrations,
    exportRegistrations
};
