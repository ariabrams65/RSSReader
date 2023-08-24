const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSubscriptions, addSubscription, deleteSubscription } = require('../controllers/subscriptionController');

router.get('/', /*auth.checkAuthenticated,*/ getSubscriptions);
router.post('/', /*auth.checkAuthenticated,*/ addSubscription);
router.delete('/', auth.checkAuthenticated, deleteSubscription);

module.exports = router;