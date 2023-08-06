const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRssHeaders } = require('../controllers/feedController');

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.json({subscriptions: req.user.subscriptions});
});

router.post('/', auth.checkAuthenticated, async (req, res) => {
    let rssHeaders;
    try {
        rssHeaders = await getRssHeaders(req.body.newSubscription);
        rssHeaders.feedUrl = req.body.newSubscription;
    } catch {
        //URL is invalid
        return res.sendStatus(400);
    }
    req.user.subscriptions.push(rssHeaders);
    try {
        await req.user.save();
    } catch {
        return res.sendStatus(500);
    }
    res.status(200).json({subscription: rssHeaders});
});

module.exports = router;