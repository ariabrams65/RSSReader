const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const subscriptionQueries = require('../db/queries/subscriptionQueries');
const feedQueries = require('../db/queries/feedQueries');
const { updateFeedsPosts } = require('../jobs/updatePosts');

async function getSubscriptions(req, res) {
    res.json({subscriptions: await subscriptionQueries.getUserSubscriptions(req.user.id)});
}

async function addSubscription(req, res) {
    if (await subscriptionQueries.subscriptionExists(req.user.id, req.body.newSubscription)) {
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
        const feedid = await subscriptionQueries.addUserSubscription(req.user.id, feedHeaders);
        const feed = await feedQueries.getFeed(feedid);
        if (feed.numposts === 0) {
            await updateFeedsPosts(feed);
            console.log('updated feed: ', feed.title);
        }
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        return res.status(500).send({
            message: 'Cannot add new feed'
        });
    }
}

async function deleteSubscription(req, res) {
    try {
        await subscriptionQueries.deleteUserSubscription(req.query.subscriptionid);
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