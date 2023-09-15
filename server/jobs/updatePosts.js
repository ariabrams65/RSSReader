const db = require('../db/db');
const { updateFeedsPosts, parseFeed, requestFeed } = require('../services/feedService');

async function updatePosts() {
    const feeds = await db.getAllFeeds();
    await Promise.all(feeds.map(async feed => {
        try {
            const headers = {};
            if (feed.lastmodified) { 
                headers['If-Modified-Since'] = feed.lastmodified;
            }
            if (feed.etag) {
                headers['If-None-Match'] = feed.etag;
            }
            const res = await requestFeed(feed.feedurl, headers);
            if (res.status === 304) {
                console.log('Already have latest posts');
                return;
            }
            if (res.headers.has('Last-Modified')) {
                await db.updateFeedLastModified(feed.id, res.headers.get('Last-Modified'));
            }
            if (res.headers.has('ETag')) {
                await db.updatefeedETag(feed.id, res.headers.get('ETag'));
            }
            const parsedFeed = await parseFeed(await res.text());
            return updateFeedsPosts(feed.id, parsedFeed.posts);
        } catch (e) {
            console.log(feed.feedurl);
            console.log(e);
            return;
        }
    }));
}
//When does the worker thread get removed??? 
if (require.main === module) {
    updatePosts()
}