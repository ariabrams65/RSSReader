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
        return res.status(400).send({
            message: 'URL is invalid'
        });
    }
    req.user.subscriptions.push(rssHeaders);
    try {
        await req.user.save();
        res.status(200).json({subscription: rssHeaders});
    } catch {
        return res.status(500).send({
            message: 'Cannot add new feed'
        });
    }
});

router.delete('/', auth.checkAuthenticated, async (req, res) => {
    req.user.subscriptions = req.user.subscriptions.filter(sub => sub.feedUrl !== req.subscription);
    try {
        await req.user.save();    
        res.sendStatus(200);
    } catch {
        return res.sendStatus(500);
    }
})

module.exports = router;