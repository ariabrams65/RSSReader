const bcrypt = require('bcrypt');
const db = require('../db/db');

async function register(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await db.createUser(req.body.email, hashedPassword); 
        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
}

module.exports = { register };

