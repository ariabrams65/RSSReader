const db = require('../../db/db');
const { updateFeedsPosts, parseFeed, requestFeed } = require('../../services/feedService');

async function process(job) {
    const feed = await db.getFeedFromId(job.data.feedid);
    const headers = {};
    if (feed.lastmodified) { 
        headers['If-Modified-Since'] = feed.lastmodified;
    }
    if (feed.etag) {
        headers['If-None-Match'] = feed.etag;
    }
    const res = await requestFeed(feed.feedurl, headers);
    if (res.status === 304) {
        return;
    }
    if ('Last-Modified' in res.headers) {
        await db.updateFeedLastModified(feed.id, res.headers['Last-Modified']);
    }
    if ('ETag' in res.headers) {
        await db.updatefeedETag(feed.id, res.headers['ETag']);
    }
    const parsedFeed = await parseFeed(res.data, feed.feedurl);
    return await updateFeedsPosts(feed.id, parsedFeed.posts);
    
}

module.exports = process;