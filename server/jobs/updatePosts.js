const db = require('../db/db');
const { updateFeedsPosts } = require('../services/postService');

async function updatePosts() {
    const feeds = await db.getAllFeeds();
    await Promise.all(feeds.map(feed => updateFeedsPosts(feed)));
}
//Should I await this???
//When does the worker thread get removed??? 
if (require.main === module) {
    updatePosts()
}