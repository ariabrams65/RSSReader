const bcrypt = require('bcrypt');
const db = require('../db/db');
const { ServerError } = require('../customErrors');

async function register(req, res, next) {
    try {
        if (!req.body.email || !req.body.password) {
            throw new ServerError('Missing username and/or password', 400);
        }
        if (await db.userExists(req.body.email)) {
            throw new ServerError('User already exists', 400);
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await db.createUser(req.body.email, hashedPassword); 
        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

module.exports = { register };

