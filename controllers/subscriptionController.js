const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');

function getSubscriptions(req, res) {
    res.json({subscriptions: req.user.subscriptions});
}

async function addSubscription(req, res) {
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
}

async function deleteSubscription(req, res) {
    req.user.subscriptions = req.user.subscriptions.filter(sub => sub.feedUrl !== req.query.subscription);
    try {
        await req.user.save();    
        res.sendStatus(200);
    } catch {
        return res.sendStatus(500);
    }
}

async function getRssHeaders(feedUrl) {
    const parser = new Parser({
        customFields: {
            feed: ['image', 'icon']
        }
    });
    const feed = await parser.parseURL(feedUrl);
    const headers = {};
    headers.feedUrl = feedUrl;
    if (feed.image !== undefined) {
        headers.icon = feed.image.url[0];
    } else {
        headers.icon = feed.icon;
    }
    headers.icon = removeTrailingSlash(headers.icon);
    headers.title = feed.title;

    return headers;
}

module.exports = { getSubscriptions, addSubscription, deleteSubscription };