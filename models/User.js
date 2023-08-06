const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    subscriptions: {
        type: [{}],
        default: []
    } 
});

module.exports = mongoose.model('User', userSchema);