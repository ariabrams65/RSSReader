const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const passport = require('passport');
const { getLoginView } = require('../controllers/authController');

router.get('/', auth.checkNotAuthenticated, getLoginView);

// router.post('/', auth.checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }));

router.post('/', auth.checkNotAuthenticated, (req, res, next) => {
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
});

module.exports = router;