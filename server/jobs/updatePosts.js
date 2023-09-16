const db = require('../db/db');
const { updateFeedsPosts, parseFeed, requestFeed } = require('../services/feedService');

//When does the worker thread get removed??? 
if (require.main === module) {
    updatePosts()
}

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
            //Should be unecessary since requestFeed throws error for any status other than 200-299
            if (res.status === 304) {
                return;
            }
            if (res.headers.has('Last-Modified')) {
                await db.updateFeedLastModified(feed.id, res.headers.get('Last-Modified'));
            }
            if (res.headers.has('ETag')) {
                await db.updatefeedETag(feed.id, res.headers.get('ETag'));
            }
            const parsedFeed = await parseFeed(await res.text(), feed.feedurl);
            return await updateFeedsPosts(feed.id, parsedFeed.posts);
        } catch {
            return;
        }
    }));
}