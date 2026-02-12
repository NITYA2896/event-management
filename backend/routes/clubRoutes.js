const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    getClubById,
    updateClub,
    approveClub,
    getAllClubsAdmin,
    getClubDashboardStats
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getClubs)
    .post(protect, authorize('clubAdmin'), createClub);

router.get('/stats', protect, authorize('clubAdmin'), getClubDashboardStats);
router.get('/admin/all', protect, authorize('superAdmin'), getAllClubsAdmin);

router.route('/:id')
    .get(getClubById)
    .put(protect, authorize('clubAdmin'), updateClub);

router.put('/:id/approve', protect, authorize('superAdmin'), approveClub);

module.exports = router;
