const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Other'],
        required: true
    },
    posterImage: {
        type: String, // URL or path
        default: ''
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    maxParticipants: {
        type: Number,
        required: true
    },
    isRegistrationRequired: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    teamSize: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
