const passport = require('passport');

function login(req, res, next) {
    passport.authenticate('local', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            return res.status(401).json({message: "Authentication failed"});
        }
        req.login(user, (error) => {
            if (error) {
                return next(error);
            }
            return res.sendStatus(200);
        });
    })(req, res, next);
}

function logout(req, res) {
    req.logout(err => {
        if (err) return next(err);
    })
    res.redirect('/login');
}

module.exports = { login, logout };