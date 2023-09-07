const passport = require('passport');
const { ServerError } = require('../customErrors');

function login(req, res, next) {
    passport.authenticate('local', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            throw new ServerError('Authentication failed', 401);
        }
        req.login(user, (error) => {
            if (error) {
                return next(error);
            }
            return res.sendStatus(204);
        });
    })(req, res, next);
}

function logout(req, res, next) {
    req.logout(err => {
        if (err) return next(err);
    })
    res.sendStatus(204);
}

function isAuthenticated(req, res) {
    if (req.isAuthenticated()) {
        return res.sendStatus(204);
    }
    throw new ServerError('', 401);
}

module.exports = { login, logout, isAuthenticated };