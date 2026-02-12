const mongoose = require('mongoose');

const registrationSchema = mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['registered', 'cancelled'],
        default: 'registered'
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    teamMembers: [{
        name: String,
        email: String,
        regNo: String,
        mobile: String
    }]
}, {
    timestamps: true
});

// Prevent duplicate registration
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
