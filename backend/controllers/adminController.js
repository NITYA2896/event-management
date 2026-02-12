const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Super Admin)
const getAdminAnalytics = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();

    // Events per category
    const eventsByCategory = await Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Most active club (by number of events)
    const mostActiveClubData = await Event.aggregate([
        { $group: { _id: '$clubId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);

    let mostActiveClub = null;
    if (mostActiveClubData.length > 0) {
        mostActiveClub = await Club.findById(mostActiveClubData[0]._id).select('name logo');
    }

    res.json({
        totalUsers,
        totalClubs,
        totalEvents,
        eventsByCategory,
        mostActiveClub: mostActiveClub ? { ...mostActiveClub.toObject(), eventCount: mostActiveClubData[0].count } : null
    });
};

module.exports = {
    getAdminAnalytics
};
