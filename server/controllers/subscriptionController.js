const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const subscriptionQueries = require('../db/queries/subscriptionQueries');
const feedQueries = require('../db/queries/feedQueries');
const { updateFeedsPosts } = require('../jobs/updatePosts');

async function getSubscriptions(req, res, next) {
    try {
        res.json({subscriptions: await subscriptionQueries.getUserSubscriptions(req.user.id)});
    } catch(e) {
        next(e);
    }
}

async function addSubscription(req, res, next) {
    try {
        const folder = req.body.folder || 'feeds';
        if (await subscriptionQueries.subscriptionExists(req.user.id, req.body.feed, folder)) {
            return res.status(400).send({
                message: 'Cannot add duplucate subscriptions'
            });
        }
        let feedHeaders;
        try {
            feedHeaders = await getFeedHeaders(req.body.feed);
        } catch {
            return res.status(400).send({
                message: 'URL is invalid'
            });
        }
        const feedid = await subscriptionQueries.addUserSubscription(req.user.id, feedHeaders, folder);
        const feed = await feedQueries.getFeed(feedid);
        if (feed.numposts === 0) {
            await updateFeedsPosts(feed);
        }
        res.sendStatus(200);
    } catch(e) {
        next(e);
    }
}

async function deleteSubscription(req, res, next) {
    try {
        await subscriptionQueries.deleteUserSubscription(req.query.subscriptionid);
        res.sendStatus(200);
    } catch (e){
        console.log(e);
        next(e);
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