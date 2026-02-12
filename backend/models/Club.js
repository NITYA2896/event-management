const mongoose = require('mongoose');

const clubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    logo: {
        type: String, // URL or path to image
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
