const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const passport = require('passport');
const { getLoginView } = require('../controllers/authController');

router.get('/', auth.checkNotAuthenticated, getLoginView);

router.post('/', auth.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;