const { createUser } = require('../services/registrationService');
const { UserError } = require('../customErrors');

async function register(req, res, next) {
    try {
        if (!req.body.email || !req.body.password) {
            throw new UserError('Missing username and/or password');
        }
        await createUser(req.body.email, req.body.password);
        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

module.exports = { register };

