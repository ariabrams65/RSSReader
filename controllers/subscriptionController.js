const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const query = require('../db/queries');

async function getSubscriptions(req, res) {
    res.json({subscriptions: await query.getUserSubscriptions(req.user.id)});
}

async function addSubscription(req, res) {
    if (await query.subscriptionExists(req.user.id, req.body.newSubscription)) {
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
        await query.addUserSubscription(req.user.id, feedHeaders);
        res.sendStatus(200);
    } catch {
        return res.status(500).send({
            message: 'Cannot add new feed'
        });
    }
}

async function deleteSubscription(req, res) {
    try {
        await query.deleteUserSubscription(req.query.subscriptionid);
        res.sendStatus(200);
    } catch (e){
        console.log(e);
        return res.sendStatus(500);
    }
}

async function getFeedHeaders(feedurl) {
    const parser = new Parser({
        customFields: {
            feed: ['image', 'icon']
        }
    });
    const feed = await parser.parseURL(feedurl);
    const headers = {};
    headers.feedurl = feedurl;
    if (feed.image !== undefined) {
        headers.iconurl = feed.image.url[0];
    } else {
        headers.iconurl = feed.icon;
    }
    headers.iconurl = removeTrailingSlash(headers.iconurl);
    headers.title = feed.title;

    return headers;
}

module.exports = { getSubscriptions, addSubscription, deleteSubscription };