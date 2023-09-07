const db = require('../db/db');

async function getFeed(req, res, next) {
    let feedIds;
    try {
        if (req.query.folder) {
            feedIds = await db.getFolderFeedIds(req.user.id, req.query.folder);
        } else if (req.query.subscriptionid) {
            feedIds = [await db.getFeedId(req.query.subscriptionid)];
        } else {
            feedIds = await db.getAllSubscribedFeedIds(req.user.id);
        }
        const posts = await db.getPosts({
            feedIds: feedIds,
            olderThan: req.query.olderThan,
            limit: req.query.limit || 100
        });
        const oldestPost = posts.slice(-1)[0];
        res.json({
            posts: posts,
            oldestPostDate: oldestPost ? oldestPost.date : undefined
    });
    } catch(e) {
        console.log(e);
        next(e);
    }
}

module.exports =  getFeed;