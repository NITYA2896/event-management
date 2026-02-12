const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
    const announcements = await Announcement.find({ expiryDate: { $gte: new Date() } })
        .populate('clubId', 'name')
        .sort('-priority -createdAt');

    res.json(announcements);
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Club Admin)
const createAnnouncement = async (req, res) => {
    const { title, message, priority, expiryDate } = req.body;

    if (!req.user.clubId) {
        res.status(403);
        throw new Error('You need a club to post announcements');
    }

    const announcement = await Announcement.create({
        title,
        message,
        priority,
        expiryDate,
        clubId: req.user.clubId
    });

    res.status(201).json(announcement);
};

module.exports = {
    getAnnouncements,
    createAnnouncement
};
