const express = require('express');
const router = express.Router();
const { logout } = require('../controllers/authController');

router.delete('/', logout);

module.exports = router;