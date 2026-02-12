const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');

// @desc    Get all events with search, filter, sort, pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const { search, category, clubId, sort, page = 1, limit = 6 } = req.query;

        let query = {};

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by club
        if (clubId) {
            query.clubId = clubId;
        }

        // Sorting
        let sortOption = {};
        if (sort === 'date_asc') {
            sortOption.eventDate = 1; // Upcoming first
        } else if (sort === 'date_desc') {
            sortOption.eventDate = -1;
        } else if (sort === 'created_desc') {
            sortOption.createdAt = -1; // Newest published
        } else if (sort === 'created_asc') {
            sortOption.createdAt = 1;
        } else if (sort === 'deadline') {
            sortOption.registrationDeadline = 1; // Earliest deadline first
        } else {
            sortOption.createdAt = -1; // Default
        }

        const events = await Event.find(query)
            .populate('clubId', 'name logo')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Event.countDocuments(query);

        res.json({
            events,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    const event = await Event.findById(req.params.id).populate('clubId', 'name logo description');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Club Admin)
const createEvent = async (req, res) => {
    const {
        title,
        description,
        category,
        posterImage,
        eventDate,
        registrationDeadline,
        maxParticipants,
        isRegistrationRequired
    } = req.body;

    // Check if user is club admin and has a club
    if (req.user.role !== 'clubAdmin' || !req.user.clubId) {
        res.status(403);
        throw new Error('Not authorized to create events');
    }

    const event = new Event({
        title,
        description,
        category,
        posterImage,
        clubId: req.user.clubId,
        eventDate,
        registrationDeadline,
        maxParticipants,
        isRegistrationRequired,
        teamSize: req.body.teamSize || 1
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Club Admin)
const updateEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Check if user is owner of the club that created the event
        if (req.user.clubId.toString() !== event.clubId.toString() && req.user.role !== 'superAdmin') {
            res.status(403);
            throw new Error('Not authorized to update this event');
        }

        event.title = req.body.title || event.title;
        event.description = req.body.description || event.description;
        event.category = req.body.category || event.category;
        event.posterImage = req.body.posterImage || event.posterImage;
        event.eventDate = req.body.eventDate || event.eventDate;
        event.registrationDeadline = req.body.registrationDeadline || event.registrationDeadline;
        event.maxParticipants = req.body.maxParticipants || event.maxParticipants;
        event.isRegistrationRequired = req.body.isRegistrationRequired !== undefined ? req.body.isRegistrationRequired : event.isRegistrationRequired;
        event.status = req.body.status || event.status;
        if (req.body.teamSize) {
            event.teamSize = Number(req.body.teamSize);
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Club Admin / Super Admin)
const deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (req.user.role === 'superAdmin' || (req.user.role === 'clubAdmin' && req.user.clubId.toString() === event.clubId.toString())) {
            await event.deleteOne();
            res.json({ message: 'Event removed' });
        } else {
            res.status(403);
            throw new Error('Not authorized to delete this event');
        }
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
