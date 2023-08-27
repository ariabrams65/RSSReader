const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { logout } = require('../controllers/authController');

router.delete('/', auth.checkAuthenticated, logout);

module.exports = router;