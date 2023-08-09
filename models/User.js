const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    feedUrl: {
        type: String,
        required: true
    },
    icon: String,
    title: String
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    subscriptions: {
        type: [subscriptionSchema],
        default: []
    } 
});

module.exports = mongoose.model('User', userSchema);