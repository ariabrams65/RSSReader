const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../controllers/authController');

router.get('/', isAuthenticated);

module.exports = router;