const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRegistrationView, register } = require('../controllers/registrationController');
    
router.get('/', auth.checkNotAuthenticated, getRegistrationView);
router.post('/', auth.checkNotAuthenticated, register);

module.exports = router;