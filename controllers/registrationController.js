const bcrypt = require('bcrypt');
const User = require('../models/User');

function getRegistrationView(req, res) {
    res.render('register.ejs');
}

async function register(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
}

module.exports = { getRegistrationView, register };

