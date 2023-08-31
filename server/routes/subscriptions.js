const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSubscriptions, addSubscription, deleteSubscription, renameSubscription, renameFolder, deleteFolder} = require('../controllers/subscriptionController');

router.get('/', auth.checkAuthenticated, getSubscriptions);
router.post('/', auth.checkAuthenticated, addSubscription);
router.delete('/', auth.checkAuthenticated, deleteSubscription);
router.patch('/rename', auth.checkAuthenticated, renameSubscription);

router.patch('/rename/folder', auth.checkAuthenticated, renameFolder);
router.delete('/folder', deleteFolder);

module.exports = router;