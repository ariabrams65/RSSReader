const bcrypt = require('bcrypt');
const userQueries = require('../db/queries/userQueries');

async function register(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await userQueries.createUser(req.body.email, hashedPassword); 
        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
}

module.exports = { register };

