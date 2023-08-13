const bcrypt = require('bcrypt');
const query = require('../db/queries');

function getRegistrationView(req, res) {
    res.render('register.ejs');
}

async function register(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await query.createUser(req.body.email, hashedPassword); 
        res.redirect('/login');
    } catch(e) {
        console.log(e);
        res.redirect('/register');
    }
}

module.exports = { getRegistrationView, register };

