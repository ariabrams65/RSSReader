const queries = require('../db/queries');

async function getFeed(req, res) {
    let feedIds;
    if (req.query.subscriptionid === undefined) {
        feedIds = await queries.getAllSubscribedFeedIds(req.user.id);
    } else {
        feedIds = [await queries.getFeedId(req.query.subscriptionid)];
    }
    const posts = await queries.getPosts({
        feedIds: feedIds,
        olderThan: req.query.olderThan,
        limit: req.query.limit
    });
    const oldestPost = posts.slice(-1)[0];
    res.json({
        posts: posts,
        oldestPostDate: oldestPost ? oldestPost.date : undefined
    });
}

module.exports =  getFeed;