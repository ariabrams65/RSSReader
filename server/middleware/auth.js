function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(401);
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.sendStatus(403);
    }
    next();
}

module.exports = {checkAuthenticated, checkNotAuthenticated};