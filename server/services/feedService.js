const db = require('../db/db');

async function getPosts(userid, folder, subscriptionid, olderThan, limit) {
    if (folder) {
        feedIds = await db.getFolderFeedIds(userid, folder);
    } else if (subscriptionid) {
        feedIds = [await db.getFeedId(subscriptionid)];
    } else {
        feedIds = await db.getAllSubscribedFeedIds(userid);
    }
    const posts = await db.getPosts({
        feedIds: feedIds,
        olderThan: olderThan,
        limit: limit || 100
    });
    return posts;
}

module.exports = { getPosts };