const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const getFeed = require('../controllers/feedController');

router.get('/', auth.checkAuthenticated, getFeed);

module.exports = router;