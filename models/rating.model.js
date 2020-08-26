const mongoose = require('mongoose');
require('./user.model');
require('./station.model');

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: String,
        required: true,
        max: 5,
        min: 1
    }
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;