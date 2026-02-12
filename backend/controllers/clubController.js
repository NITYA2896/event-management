const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private (Club Admin)
const createClub = async (req, res) => {
    const { name, description, logo } = req.body;

    if (req.user.role !== 'clubAdmin') {
        res.status(403);
        throw new Error('Only Club Admins can create clubs');
    }

    const clubExists = await Club.findOne({ name });

    if (clubExists) {
        res.status(400);
        throw new Error('Club already exists');
    }

    const club = await Club.create({
        name,
        description,
        logo,
        createdBy: req.user._id
    });

    if (club) {
        // Update user with clubId
        const user = await User.findById(req.user._id);
        user.clubId = club._id;
        await user.save();

        res.status(201).json(club);
    } else {
        res.status(400);
        throw new Error('Invalid club data');
    }
};

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
    const clubs = await Club.find({ approved: true });
    res.json(clubs);
};

// @desc    Get club by ID
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res) => {
    const club = await Club.findById(req.params.id);

    if (club) {
        res.json(club);
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
};

// @desc    Update club details
// @route   PUT /api/clubs/:id
// @access  Private (Club Admin)
const updateClub = async (req, res) => {
    const club = await Club.findById(req.params.id);

    if (club) {
        if (req.user.clubId.toString() !== club._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this club');
        }

        club.name = req.body.name || club.name;
        club.description = req.body.description || club.description;
        club.logo = req.body.logo || club.logo;

        const updatedClub = await club.save();
        res.json(updatedClub);
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
};

// @desc    Approve a club status
// @route   PUT /api/clubs/:id/approve
// @access  Private (Super Admin)
const approveClub = async (req, res) => {
    const club = await Club.findById(req.params.id);

    if (club) {
        club.approved = req.body.approved; // boolean
        const updatedClub = await club.save();
        res.json(updatedClub);
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
};

// @desc    Get all clubs for super admin (including pending)
// @route   GET /api/clubs/admin/all
// @access  Private (Super Admin)
const getAllClubsAdmin = async (req, res) => {
    const clubs = await Club.find({}).populate('createdBy', 'name email');
    res.json(clubs);
};

// @desc    Get club dashboard stats
// @route   GET /api/clubs/stats
// @access  Private (Club Admin)
const getClubDashboardStats = async (req, res) => {
    // 1. Get total events created by this club
    const totalEvents = await Event.countDocuments({ clubId: req.user.clubId });

    // 2. Get total registrations for these events
    // First find all event IDs for this club
    const clubEvents = await Event.find({ clubId: req.user.clubId }).select('_id');
    const clubEventIds = clubEvents.map(event => event._id);

    const totalRegistrations = await Registration.countDocuments({
        eventId: { $in: clubEventIds },
        status: 'registered'
    });

    // 3. Get upcoming events count
    const upcomingEvents = await Event.countDocuments({
        clubId: req.user.clubId,
        eventDate: { $gte: new Date() }
    });

    res.json({
        totalEvents,
        totalRegistrations,
        upcomingEvents
    });
};

module.exports = {
    createClub,
    getClubs,
    getClubById,
    updateClub,
    approveClub,
    getAllClubsAdmin,
    getClubDashboardStats
};
