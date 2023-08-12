const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const query = require('../db/dbConn');

function getSubscriptions(req, res) {
    res.json({subscriptions: query.getUserSubscriptions(req.user.id)});
}

async function addSubscription(req, res) {
    if (query.subscriptionExists(req.user.id, req.body.newSubscription)) {
        return res.status(400).send({
            message: 'Cannot add duplucate subscriptions'
        });
    }
    let feedHeaders;
    try {
        feedHeaders = await getFeedHeaders(req.body.newSubscription);
    } catch {
        return res.status(400).send({
            message: 'URL is invalid'
        });
    }
    try {
        const subscription = await query.addUserSubscription(req.user.id, feedHeaders);
        res.status(200).json({
            subscription: feedHeaders,
            subscriptionId: subscription.id
        });
    } catch {
        return res.status(500).send({
            message: 'Cannot add new feed'
        });
    }
}

async function deleteSubscription(req, res) {
    try {
        query.deleteUserSubscription(req.query.subscriptionId);
    } catch {
        return res.sendStatus(500);
    }
}

async function getFeedHeaders(feedUrl) {
    const parser = new Parser({
        customFields: {
            feed: ['image', 'icon']
        }
    });
    const feed = await parser.parseURL(feedUrl);
    const headers = {};
    headers.feedUrl = feedUrl;
    if (feed.image !== undefined) {
        headers.iconUrl = feed.image.url[0];
    } else {
        headers.iconUrl = feed.icon;
    }
    headers.iconUrl = removeTrailingSlash(headers.iconUrl);
    headers.title = feed.title;

    return headers;
}

module.exports = { getSubscriptions, addSubscription, deleteSubscription };