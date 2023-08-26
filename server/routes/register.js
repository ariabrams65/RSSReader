const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register } = require('../controllers/registrationController');
    
router.post('/', auth.checkNotAuthenticated, register);

module.exports = router;