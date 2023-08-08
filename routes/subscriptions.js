const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRssHeaders } = require('../controllers/feedController');

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.json({subscriptions: req.user.subscriptions});
});

router.post('/', auth.checkAuthenticated, async (req, res) => {
    if (req.user.subscriptions.some(sub => sub.feedUrl === req.body.newSubscription)) {
        return res.status(400).send({
            message: 'Cannot add duplucate subscriptions'
        });
    }
    let rssHeaders;
    try {
        rssHeaders = await getRssHeaders(req.body.newSubscription);
    } catch {
        //URL is invalid
        return res.status(400).send({
            message: 'URL is invalid'
        });
    }
    req.user.subscriptions.push(rssHeaders);
    try {
        await req.user.save();
    } catch {
        return res.status(500).send({
            message: 'Cannot add new feed'
        });
    }
    res.status(200).json({subscription: rssHeaders});
});

module.exports = router;